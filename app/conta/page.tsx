import { getChatGPTUser } from '@/app/chatgpt-auth';
import Profile from './profile';
export const dynamic = 'force-dynamic';
export default async function AccountPage() { const user = await getChatGPTUser(); if (!user) return <main className="utility-page"><h1>Minha conta</h1><p>O cadastro de clientes está em configuração. Você pode comprar e combinar o pagamento pelo WhatsApp sem criar uma conta.</p><a href="/">Voltar à loja</a><p><a href="/admin/login">Acesso administrativo</a></p></main>; return <Profile />; }
