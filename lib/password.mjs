import { randomBytes, timingSafeEqual, createHash } from 'node:crypto';
import { scryptAsync } from '@noble/hashes/scrypt.js';
// Fixed parameters prevent attacker-controlled resource usage.
const options = { N: 32768, r: 8, p: 3, dkLen: 32, maxmem: 64 * 1024 * 1024 };
const derive = async (password, salt) => Buffer.from(await scryptAsync(new TextEncoder().encode(password),new TextEncoder().encode(salt),options));
export const digest = value => createHash('sha256').update(value).digest('hex');
let verifying = false;
export async function hashPassword(password) {
  if (password.length < 14 || password.length > 128) throw new Error('Use uma senha de 14 a 128 caracteres.');
  const salt = randomBytes(16).toString('hex');
  if (verifying) throw new Error('Password verification busy');
  verifying = true;
  try {
    const key = await derive(password, salt);
    return `scrypt-v1:${salt}:${key.toString('hex')}`;
  } finally { verifying = false; }
}
export async function verifyPassword(password, encoded) {
  if (typeof password !== 'string' || password.length > 128 || !/^scrypt-v1:[a-f0-9]{32}:[a-f0-9]{64}$/.test(encoded || '')) return false;
  const [, salt, hash] = encoded.split(':');
  // Avoid allocating multiple scrypt workspaces concurrently within one isolate.
  if (verifying) throw new Error('Password verification busy');
  verifying = true;
  try { return timingSafeEqual(await derive(password, salt), Buffer.from(hash, 'hex')); }
  finally { verifying = false; }
}
