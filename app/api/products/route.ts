import { getDb } from '@/db';
import { products } from '@/db/schema';
import { adminAllowed, sameOrigin } from '@/lib/access';
import { eq, count } from 'drizzle-orm';
import { z } from 'zod';
export const dynamic = 'force-dynamic';
const productSchema = z.object({
  id: z.string().min(1).max(80), name: z.string().trim().min(2).max(120),
  category: z.enum(['Cabelo', 'Barba', 'Kits', 'Corpo']), description: z.string().trim().min(3).max(1500),
  price: z.number().int().min(1).max(10000000), stock: z.number().int().min(0).max(100000),
  image: z.string().max(2000).refine(value => value.startsWith('/assets/') || /^https:\/\//.test(value)), active: z.boolean(),
});
export async function GET(request: Request) {
  const all = new URL(request.url).searchParams.get('all') === '1';
  if (all && !(await adminAllowed())) return Response.json({ error: 'Acesso restrito ao administrador.' }, { status: 403 });
  const data = all ? await getDb().select().from(products) : await getDb().select().from(products).where(eq(products.active, true));
  const [total] = await getDb().select({ value: count() }).from(products);
  return Response.json(data, { headers: { 'Cache-Control': 'no-store', 'X-Catalog-Initialized': total.value > 0 ? '1' : '0' } });
}
export async function POST(request: Request) {
  if (!sameOrigin(request) || !(await adminAllowed())) return Response.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  const parsed = productSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: 'Verifique os campos do produto.' }, { status: 400 });
  await getDb().insert(products).values(parsed.data).onConflictDoUpdate({ target: products.id, set: parsed.data });
  return Response.json({ ok: true });
}
