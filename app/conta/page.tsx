import { requireChatGPTUser } from '@/app/chatgpt-auth';
import Profile from './profile';
export const dynamic = 'force-dynamic';
export default async function AccountPage() { await requireChatGPTUser('/conta'); return <Profile />; }
