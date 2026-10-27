import { adminAllowed } from '@/lib/access';
import { requireChatGPTUser } from '@/app/chatgpt-auth';
import Admin from './panel';
export const dynamic = 'force-dynamic';
export default async function AdminPage() {
  await requireChatGPTUser('/admin');
  if (!(await adminAllowed())) return <main className="utility-page"><h1>Acesso restrito</h1><p>Esta área está disponível somente para a conta administrativa cadastrada.</p><a className="gold-button" href="/">VOLTAR À LOJA</a></main>;
  return <Admin />;
}
