import { getDb } from '@/db';
import { interests } from '@/db/schema';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import { sameOrigin } from '@/lib/access';
import { z } from 'zod';
export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user || !sameOrigin(request)) return Response.json({ error: 'Entre na sua conta para cadastrar seu interesse.' }, { status: 401 });
  const parsed = z.object({ name: z.string().trim().min(2).max(120), email: z.string().email().max(200), consent: z.literal(true) }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: 'Preencha os campos e autorize o cadastro.' }, { status: 400 });
  const data = { userId: user.userId, name: parsed.data.name, email: parsed.data.email, createdAt: new Date().toISOString() };
  await getDb().insert(interests).values(data).onConflictDoUpdate({ target: interests.userId, set: data });
  return Response.json({ ok: true });
}
