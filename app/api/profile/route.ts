import { getDb } from '@/db';
import { profiles } from '@/db/schema';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import { sameOrigin } from '@/lib/access';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
export const dynamic = 'force-dynamic';
export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: 'Entre para acessar seu cadastro.' }, { status: 401 });
  const [profile] = await getDb().select().from(profiles).where(eq(profiles.userId, user.userId));
  return Response.json(profile ?? { name: user.fullName ?? '', email: user.email, phone: '' }, { headers: { 'Cache-Control': 'no-store' } });
}
export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user || !sameOrigin(request)) return Response.json({ error: 'Entre novamente para salvar.' }, { status: 401 });
  const parsed = z.object({ name: z.string().trim().min(2).max(120), phone: z.string().max(24).regex(/^[\d\s()+-]*$/) }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: 'Verifique nome e telefone.' }, { status: 400 });
  const data = { ...parsed.data, userId: user.userId, email: user.email, updatedAt: new Date().toISOString() };
  await getDb().insert(profiles).values(data).onConflictDoUpdate({ target: profiles.userId, set: data });
  return Response.json({ ok: true });
}
