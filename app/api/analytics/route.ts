import { z } from 'zod';
import { adminAllowed, sameOrigin } from '@/lib/access';
import { analyticsDb,reportDay } from '@/lib/analytics';
import { digest } from '@/lib/password.mjs';
const schema=z.discriminatedUnion('kind',[
 z.object({kind:z.literal('checkout'),attempt:z.string().uuid()}),
 z.object({kind:z.enum(['visit','reseller','contact']),session:z.string().uuid()}),
]);
export async function POST(request:Request){
 if(!sameOrigin(request))return new Response(null,{status:403});
 if(await adminAllowed())return new Response(null,{status:204});
 if(Number(request.headers.get('content-length'))>1024)return new Response(null,{status:413});
 try{
 const reader=request.body?.getReader();if(!reader)return new Response(null,{status:400});
 let size=0;const chunks:Uint8Array[]=[];
 while(true){const part=await reader.read();if(part.done)break;size+=part.value.length;if(size>1024){await reader.cancel();return new Response(null,{status:413});}chunks.push(part.value);}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
 const text=new TextDecoder().decode(bytes);
 const parsed=schema.safeParse(JSON.parse(text));if(!parsed.success)return new Response(null,{status:400});
 const db=analyticsDb(),data=parsed.data,now=Date.now();
 const rateKey='analytics:'+digest(request.headers.get('cf-connecting-ip')||'local');
 const limit=await db.prepare(`INSERT INTO login_attempts (key,attempts,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN expires_at<=? THEN 1 ELSE attempts+1 END,expires_at=CASE WHEN expires_at<=? THEN excluded.expires_at ELSE expires_at END RETURNING attempts`).bind(rateKey,now+900000,now,now).first<{attempts:number}>();
 if(!limit||limit.attempts>120)return new Response(null,{status:429});
 if(data.kind==='checkout'){
   // Only an attempt issued after server validation can become a checkout event.
   await db.batch([
   db.prepare(`INSERT OR IGNORE INTO analytics_events (id,kind,day,session_key,created_at) SELECT 'visit:'||day||':'||session_key,'visit',day,session_key,? FROM analytics_events WHERE id=? AND kind='prepared' AND created_at>?`).bind(now,data.attempt,now-600000),
   db.prepare(`INSERT OR IGNORE INTO analytics_events (id,kind,day,session_key,created_at) SELECT 'checkout:'||day||':'||session_key,'checkout',day,session_key,? FROM analytics_events WHERE id=? AND kind='prepared' AND created_at>?`).bind(now,data.attempt,now-600000),db.prepare("DELETE FROM analytics_events WHERE id=? AND kind='prepared'").bind(data.attempt)]);
 }else{
   const key=digest(data.session),day=reportDay();
   await db.batch([
     // A click always has a corresponding visit, even if its first request was lost.
     db.prepare('INSERT OR IGNORE INTO analytics_events (id,kind,day,session_key,created_at) VALUES (?,?,?,?,?)').bind(`visit:${day}:${key}`,'visit',day,key,now),
     db.prepare('INSERT OR IGNORE INTO analytics_events (id,kind,day,session_key,created_at) VALUES (?,?,?,?,?)').bind(`${data.kind}:${day}:${key}`,data.kind,day,key,now),
   ]);
 }
 await db.prepare("DELETE FROM analytics_events WHERE kind='prepared' AND created_at<?").bind(now-600000).run();
 return new Response(null,{status:204});
 }catch{return new Response(null,{status:503});}
}
