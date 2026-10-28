import { env } from 'cloudflare:workers';
import { cookies } from 'next/headers';
import { digest } from './password.mjs';
export const SESSION_COOKIE = '__Host-felcor-admin';
export const SESSION_SECONDS = 8 * 60 * 60;
export function adminConfig() {
  return env as unknown as { DB: D1Database; ADMIN_EMAIL?: string; ADMIN_PASSWORD_HASH?: string };
}
export async function sessionAdmin() {
  const config = adminConfig();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token) || !config.ADMIN_EMAIL || !config.ADMIN_PASSWORD_HASH) return null;
  try {
    const row = await config.DB.prepare('SELECT email FROM admin_sessions WHERE token_hash = ? AND expires_at > ? AND credential_version = ?')
      .bind(digest(token), Date.now(), digest(config.ADMIN_PASSWORD_HASH)).first<{email: string}>();
    return row?.email === config.ADMIN_EMAIL.trim().toLowerCase() ? row : null;
  } catch { return null; }
}
