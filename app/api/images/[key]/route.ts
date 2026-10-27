import { env } from 'cloudflare:workers';
import { IMAGE_KEY } from '@/lib/images';

export async function GET(_request: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!IMAGE_KEY.test(key)) return new Response('Imagem não encontrada.', { status: 404 });
  if (!env.BUCKET) return new Response('Armazenamento indisponível.', { status: 503 });
  const image = await env.BUCKET.get(`images/${key}`);
  if (!image) return new Response('Imagem não encontrada.', { status: 404 });
  return new Response(image.body, { headers: { 'Content-Type': image.httpMetadata?.contentType || 'application/octet-stream', 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'; sandbox", ETag: image.httpEtag } });
}
