import Storefront from './storefront';
import { adminAllowed } from '@/lib/access';
export const dynamic = 'force-dynamic';
export default async function Home() { return <Storefront isAdmin={await adminAllowed()} />; }
