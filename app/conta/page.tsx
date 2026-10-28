import { getChatGPTUser } from '@/app/chatgpt-auth';
import Profile from './profile';
import CustomerAccess from './access';
export const dynamic = 'force-dynamic';
export default async function AccountPage() { const user = await getChatGPTUser(); return user ? <Profile /> : <CustomerAccess />; }
