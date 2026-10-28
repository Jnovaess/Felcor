import { cookies } from 'next/headers';
import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { adminConfig, SESSION_COOKIE, SESSION_SECONDS } from '@/lib/admin-session';
import { digest, verifyPassword } from '@/lib/password.mjs';
import { sameOrigin } from '@/lib/access';

export async function POST(request: Request) {
  if (!sameOrigin(request) || new URL(request.url).protocol !== 'https:') return Response.json({error:'Use o endereço HTTPS da loja.'}, {status:403});
  const config = adminConfig();
  if (!config.ADMIN_EMAIL || !config.ADMIN_PASSWORD_HASH) return Response.json({error:'O proprietário precisa configurar o acesso administrativo.'}, {status:503});
  if (Number(request.headers.get('content-length')) > 4096) return Response.json({error:'Dados inválidos.'}, {status:413});
  try {
    const now = Date.now();
    // Cloudflare overwrites CF-Connecting-IP at the edge. Both IP and account are limited.
    const keys = ['ip:' + digest(request.headers.get('cf-connecting-ip') || 'local'), 'admin'];
    const attempts = await config.DB.batch<{attempts:number}>(keys.map(key => config.DB.prepare(`INSERT INTO login_attempts (key, attempts, expires_at) VALUES (?, 1, ?)
      ON CONFLICT(key) DO UPDATE SET attempts = CASE WHEN expires_at <= ? THEN 1 ELSE attempts + 1 END,
      expires_at = CASE WHEN expires_at <= ? THEN excluded.expires_at ELSE expires_at END RETURNING attempts`).bind(key, now + 900000, now, now)));
    if (attempts.some((result, i) => Number(result.results[0]?.attempts) > (i === 0 ? 10 : 30))) return Response.json({error:'Muitas tentativas. Aguarde 15 minutos.'}, {status:429, headers:{'Retry-After':'900'}});
    const parsed = z.object({email:z.string().email().max(254),password:z.string().min(1).max(128)}).safeParse(await request.json());
    if (!parsed.success) return Response.json({error:'E-mail ou senha incorretos.'}, {status:401});
    const valid = await verifyPassword(parsed.data.password, config.ADMIN_PASSWORD_HASH);
    const email = config.ADMIN_EMAIL.trim().toLowerCase();
    if (!valid || parsed.data.email.trim().toLowerCase() !== email) return Response.json({error:'E-mail ou senha incorretos.'}, {status:401});
    const token = randomBytes(32).toString('hex');
    const previous = (await cookies()).get(SESSION_COOKIE)?.value || '';
    await config.DB.batch([
      config.DB.prepare('DELETE FROM admin_sessions WHERE expires_at <= ? OR token_hash = ?').bind(now, digest(previous)),
      config.DB.prepare('DELETE FROM login_attempts WHERE expires_at <= ?').bind(now),
      config.DB.prepare('INSERT INTO admin_sessions (token_hash, email, credential_version, expires_at) VALUES (?, ?, ?, ?)').bind(digest(token), email, digest(config.ADMIN_PASSWORD_HASH), now + SESSION_SECONDS * 1000),
    ]);
    (await cookies()).set(SESSION_COOKIE, token, {httpOnly:true,secure:true,sameSite:'strict',path:'/',maxAge:SESSION_SECONDS});
    return Response.json({ok:true}, {headers:{'Cache-Control':'no-store'}});
  } catch (error) { console.error('Admin login unavailable:', error instanceof Error ? error.message : 'unknown error'); return Response.json({error:'Não foi possível entrar. Verifique a configuração do banco ou tente novamente.'}, {status:503}); }
}
