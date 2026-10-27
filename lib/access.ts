import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '@/app/chatgpt-auth';
export async function adminAllowed() {
  const user = await getChatGPTUser();
  const expected = (env as unknown as { ADMIN_EMAIL?: string }).ADMIN_EMAIL;
  return !!user && !!expected && user.email.toLowerCase() === expected.toLowerCase();
}
export function sameOrigin(request: Request) {
  return request.headers.get('origin') === new URL(request.url).origin;
}
