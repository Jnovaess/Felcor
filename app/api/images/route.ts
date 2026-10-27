import { env } from 'cloudflare:workers';
import { adminAllowed, sameOrigin } from '@/lib/access';
import { imageType, MAX_IMAGE_BYTES } from '@/lib/images';

export async function POST(request: Request) {
  if (!sameOrigin(request) || !(await adminAllowed())) return Response.json({ error: 'Acesso restrito ao administrador.' }, { status: 403 });
  if (!env.BUCKET) return Response.json({ error: 'Armazenamento de imagens indisponível. Tente novamente.' }, { status: 503 });
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.startsWith('multipart/form-data;')) return Response.json({ error: 'Selecione um arquivo de imagem.' }, { status: 400 });
  const limit = MAX_IMAGE_BYTES + 65536;
  const reader = request.body?.getReader();
  if (!reader) return Response.json({ error: 'Arquivo não recebido.' }, { status: 400 });
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const result = await reader.read();
    if (result.done) break;
    length += result.value.byteLength;
    if (length > limit) { await reader.cancel(); return Response.json({ error: 'A imagem deve ter no máximo 5 MB.' }, { status: 413 }); }
    chunks.push(result.value);
  }
  try {
    const body = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
    const form = await new Response(body, { headers: { 'Content-Type': contentType } }).formData();
    const file = form.get('image');
    if (!(file instanceof File) || !file.size) return Response.json({ error: 'Selecione uma imagem PNG, JPEG ou WebP.' }, { status: 400 });
    if (file.size > MAX_IMAGE_BYTES) return Response.json({ error: 'A imagem deve ter no máximo 5 MB.' }, { status: 413 });
    const bytes = new Uint8Array(await file.arrayBuffer());
    const type = imageType(bytes);
    if (!type || type.mime !== file.type) return Response.json({ error: 'Formato inválido. Use PNG, JPEG ou WebP.' }, { status: 400 });
    const key = `${crypto.randomUUID()}.${type.extension}`;
    await env.BUCKET.put(`images/${key}`, bytes, { httpMetadata: { contentType: type.mime, cacheControl: 'public, max-age=31536000, immutable' } });
    return Response.json({ url: `/api/images/${key}` }, { status: 201 });
  } catch {
    return Response.json({ error: 'Não foi possível enviar a imagem. Tente novamente.' }, { status: 500 });
  }
}
