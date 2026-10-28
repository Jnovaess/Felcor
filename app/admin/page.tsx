import { adminAllowed } from '@/lib/access';
import { redirect } from 'next/navigation';
import Admin from './panel';
export const dynamic = 'force-dynamic';
export default async function AdminPage() {
  if (!(await adminAllowed())) redirect('/admin/login');
  return <Admin />;
}
