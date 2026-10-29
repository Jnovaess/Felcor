import { adminAllowed } from '@/lib/access';
import { redirect } from 'next/navigation';
import Reports from './reports';
export const dynamic='force-dynamic';
export default async function ReportsPage(){if(!await adminAllowed())redirect('/admin/login');return <Reports/>;}
