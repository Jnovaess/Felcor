import { cookies } from 'next/headers';
import { adminConfig, SESSION_COOKIE } from '@/lib/admin-session';
import { sameOrigin } from '@/lib/access';
import { digest } from '@/lib/password.mjs';
export async function POST(request: Request) {
  if (!sameOrigin(request)) return new Response('Acesso negado', {status:403});
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await adminConfig().DB.prepare('DELETE FROM admin_sessions WHERE token_hash = ?').bind(digest(token)).run();
  jar.set(SESSION_COOKIE, '', {httpOnly:true,secure:true,sameSite:'strict',path:'/',maxAge:0});
  return Response.redirect(new URL('/admin/login',request.url),303);
}
