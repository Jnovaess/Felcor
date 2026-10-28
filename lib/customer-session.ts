import { cookies } from 'next/headers';
import { adminConfig } from './admin-session';
import { digest } from './password.mjs';
export const CUSTOMER_COOKIE = '__Host-felcor-customer';
export async function customerUser() {
  const token = (await cookies()).get(CUSTOMER_COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const row = await adminConfig().DB.prepare('SELECT u.id, u.email, u.name FROM customer_sessions s JOIN customer_accounts u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ?').bind(digest(token),Date.now()).first<{id:string;email:string;name:string}>();
  return row ? {userId:row.id,email:row.email,fullName:row.name,displayName:row.name} : null;
}
