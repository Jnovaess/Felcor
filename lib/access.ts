import { sessionAdmin } from './admin-session';
export async function adminAllowed() {
  return !!(await sessionAdmin());
}
export function sameOrigin(request: Request) {
  return request.headers.get('origin') === new URL(request.url).origin;
}
