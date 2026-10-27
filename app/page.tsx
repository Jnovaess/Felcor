import Storefront from './storefront';
import { adminAllowed } from '@/lib/access';
import { env } from 'cloudflare:workers';
import { whatsappNumber } from '@/lib/whatsapp';
export const dynamic = 'force-dynamic';
export default async function Home() {
  const whatsappReady = !!whatsappNumber((env as unknown as { WHATSAPP_NUMBER?: string }).WHATSAPP_NUMBER);
  return <Storefront isAdmin={await adminAllowed()} whatsappReady={whatsappReady} />;
}
