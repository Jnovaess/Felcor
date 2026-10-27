export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const IMAGE_KEY = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(png|jpg|webp)$/;
export function imageType(bytes: Uint8Array) {
  if ([137, 80, 78, 71, 13, 10, 26, 10].every((value, index) => bytes[index] === value)) return { extension: 'png', mime: 'image/png' };
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return { extension: 'jpg', mime: 'image/jpeg' };
  if (new TextDecoder().decode(bytes.slice(0, 4)) === 'RIFF' && new TextDecoder().decode(bytes.slice(8, 12)) === 'WEBP') return { extension: 'webp', mime: 'image/webp' };
  return null;
}
export function validImageUrl(value: string) {
  if (value.startsWith('/api/images/')) return IMAGE_KEY.test(value.slice('/api/images/'.length));
  if (/^\/assets\/[a-zA-Z0-9._-]+$/.test(value)) return true;
  try { const parsed = new URL(value); return parsed.protocol === 'https:' && !parsed.username && !parsed.password; } catch { return false; }
}
