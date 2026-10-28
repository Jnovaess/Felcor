import { cookies } from 'next/headers';
import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { sameOrigin } from '@/lib/access';
import { adminConfig } from '@/lib/admin-session';
import { CUSTOMER_COOKIE } from '@/lib/customer-session';
import { hashPassword, verifyPassword, digest } from '@/lib/password.mjs';
const schema=z.object({action:z.enum(['login','register','logout']),email:z.string().trim().email().max(254).optional(),password:z.string().min(14).max(128).optional(),name:z.string().trim().min(2).max(120).optional(),consent:z.boolean().optional()});
export async function POST(request: Request) {
  if (!sameOrigin(request) || new URL(request.url).protocol!=='https:') return Response.json({error:'Requisição não autorizada.'},{status:403});
  try {
    // Read a bounded body even when Content-Length is absent.
    const reader=request.body?.getReader();let bytes=0;const chunks:Uint8Array[]=[];
    if(!reader) return Response.json({error:'Dados inválidos.'},{status:400});
    while(true){const part=await reader.read();if(part.done)break;bytes+=part.value.length;if(bytes>4096){await reader.cancel();return Response.json({error:'Dados inválidos.'},{status:413});}chunks.push(part.value);}
    const body=new Uint8Array(bytes);let offset=0;for(const chunk of chunks){body.set(chunk,offset);offset+=chunk.length;}
    const parsed=schema.safeParse(JSON.parse(new TextDecoder().decode(body)));
    if(!parsed.success) return Response.json({error:'Confira os campos. A senha deve ter de 14 a 128 caracteres.'},{status:400});
    const data=parsed.data;const db=adminConfig().DB;const jar=await cookies();const now=Date.now();
    if(data.action==='logout'){
      const token=jar.get(CUSTOMER_COOKIE)?.value;
      if(token)await db.prepare('DELETE FROM customer_sessions WHERE token_hash = ?').bind(digest(token)).run();
      jar.set(CUSTOMER_COOKIE,'',{httpOnly:true,secure:true,sameSite:'strict',path:'/',maxAge:0});
      return Response.json({ok:true});
    }
    const key='customer:'+digest(request.headers.get('cf-connecting-ip')||'local');
    const rate=await db.prepare(`INSERT INTO login_attempts (key,attempts,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN expires_at<=? THEN 1 ELSE attempts+1 END, expires_at=CASE WHEN expires_at<=? THEN excluded.expires_at ELSE expires_at END RETURNING attempts`).bind(key,now+900000,now,now).first<{attempts:number}>();
    if(!rate || rate.attempts>10)return Response.json({error:'Muitas tentativas. Aguarde 15 minutos.'},{status:429});
    if(!data.email || !data.password || (data.action==='register' && (!data.name || !data.consent)))return Response.json({error:'Preencha os campos e autorize o cadastro.'},{status:400});
    const email=data.email.toLowerCase();
    if(data.action==='register'){
      const hash=await hashPassword(data.password);
      await db.prepare('INSERT INTO customer_accounts (id,email,name,password_hash,created_at) VALUES (?,?,?,?,?) ON CONFLICT(email) DO NOTHING RETURNING id').bind(crypto.randomUUID(),email,data.name!,hash,new Date().toISOString()).first();
      // Registration does not sign in or prove ownership of the address.
      return Response.json({ok:true,message:'Se o e-mail estava disponível, o cadastro foi criado. Entre com sua senha. Se já possui conta, use a senha cadastrada.'},{headers:{'Cache-Control':'no-store'}});
    }
    const account=await db.prepare('SELECT id,password_hash FROM customer_accounts WHERE email = ?').bind(email).first<{id:string;password_hash:string}>();
    // Perform the same KDF for unknown addresses to avoid a fast existence oracle.
    const fallback='scrypt-v1:'+ '0'.repeat(32)+':'+ '0'.repeat(64);
    const valid=await verifyPassword(data.password,account?.password_hash||fallback);
    if(!account||!valid)return Response.json({error:'E-mail ou senha incorretos.'},{status:401});
    const token=randomBytes(32).toString('hex');const previous=jar.get(CUSTOMER_COOKIE)?.value||'';
    await db.batch([db.prepare('DELETE FROM customer_sessions WHERE expires_at <= ? OR token_hash = ?').bind(now,digest(previous)),db.prepare('INSERT INTO customer_sessions (token_hash,user_id,expires_at) VALUES (?,?,?)').bind(digest(token),account.id,now+28800000)]);
    jar.set(CUSTOMER_COOKIE,token,{httpOnly:true,secure:true,sameSite:'strict',path:'/',maxAge:28800});
    return Response.json({ok:true},{headers:{'Cache-Control':'no-store'}});
  }catch{return Response.json({error:'Não foi possível concluir. Tente novamente em instantes.'},{status:503});}
}
