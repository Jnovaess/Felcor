import { env } from 'cloudflare:workers';
import { getDb } from '@/db';
import { products } from '@/db/schema';
import { sameOrigin } from '@/lib/access';
import { orderLink, whatsappNumber } from '@/lib/whatsapp';
import { catalogAvailability, enoughStock } from '@/lib/availability';
import { z } from 'zod';
import { prepareCheckout } from '@/lib/analytics';

const schema = z.object({ session:z.string().uuid().optional(), items: z.array(z.object({ id: z.string().min(1).max(80), quantity: z.number().int().min(1).max(100) })).min(1).max(20) });
export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: 'Requisição não autorizada.' }, { status: 403 });
  const phone = whatsappNumber((env as unknown as { WHATSAPP_NUMBER?: string }).WHATSAPP_NUMBER);
  if (!phone) return Response.json({ error: 'O WhatsApp da loja ainda está sendo configurado.' }, { status: 503 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: 'Revise os itens e quantidades da sacola.' }, { status: 400 });
  const ids = parsed.data.items.map(item => item.id);
  if (new Set(ids).size !== ids.length) return Response.json({ error: 'A sacola contém itens repetidos. Atualize a página.' }, { status: 400 });
  const stored = await getDb().select().from(products);
  const current = catalogAvailability(stored);
  if(!enoughStock(stored, parsed.data.items)) return Response.json({error:'Quantidade indisponível. O kit compartilha o estoque das pomadas avulsas.'},{status:409});
  const items = [];
  for (const requested of parsed.data.items) {
    const product = current.find(item => item.id === requested.id);
    if (!product || !product.active || product.price <= 0 || product.stock < requested.quantity) return Response.json({ error: 'Um produto mudou de disponibilidade ou quantidade. Atualize a página e revise a sacola.' }, { status: 409 });
    items.push({ name: product.name, price: product.price, quantity: requested.quantity });
  }
  const attempt=await prepareCheckout(parsed.data.session||crypto.randomUUID());
  return Response.json({ url: orderLink(phone, items),attempt }, { headers: { 'Cache-Control': 'no-store' } });
}
