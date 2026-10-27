import { getDb } from '@/db';
import { profiles, interests, products } from '@/db/schema';
import { adminAllowed, sameOrigin } from '@/lib/access';
import { demoProducts } from '@/lib/catalog';
import { inArray } from 'drizzle-orm';
export const dynamic = 'force-dynamic';
export async function GET() {
  if (!(await adminAllowed())) return Response.json({ error: 'Acesso restrito.' }, { status: 403 });
  const database = getDb();
  return Response.json({ profiles: await database.select().from(profiles), interests: await database.select().from(interests) }, { headers: { 'Cache-Control': 'no-store' } });
}
export async function POST(request: Request) {
  if (!sameOrigin(request) || !(await adminAllowed())) return Response.json({ error: 'Acesso restrito.' }, { status: 403 });
  const database = getDb();
  await database.batch([
    database.update(products).set({ active: false }).where(inArray(products.id, ['matte-clay', 'leave-in', 'grooming', 'balm', 'kit-estilo', 'kit-rotina'])),
    database.insert(products).values(demoProducts).onConflictDoNothing(),
  ]);
  return Response.json({ ok: true });
}
