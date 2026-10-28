'use client';
import { useEffect, useState, type FormEvent } from 'react';
export default function Profile() {
  const [data, setData] = useState({ name: '', phone: '', email: '' });
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(true);
  useEffect(() => { fetch('/api/profile').then(async response => { if (!response.ok) throw new Error('Não foi possível carregar seu cadastro.'); setData(await response.json()); }).catch(reason => setStatus(reason.message)).finally(() => setBusy(false)); }, []);
  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setStatus('');
    try { const response = await fetch('/api/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); const result = await response.json() as { error?: string }; if (!response.ok) throw new Error(result.error); setStatus('Seus dados foram salvos com sucesso.'); } catch (reason) { setStatus(reason instanceof Error ? reason.message : 'Não foi possível salvar.'); } finally { setBusy(false); }
  }
  return <><div className="utility-header"><a href="/"><img src="/assets/felcor-logo.jpg" alt="Felcor" /></a><a href="/">← Voltar à loja</a></div><main className="utility-page"><p className="eyebrow">SUA CONTA FELCOR</p><h1>Minha conta</h1><p>Atualize seus dados. Seu cadastro fica salvo para suas próximas visitas.</p><form className="panel profile-form" onSubmit={save}><label className="field">Nome completo<input required minLength={2} maxLength={120} value={data.name} onChange={event => setData({ ...data, name: event.target.value })} /></label><label className="field">E-mail da conta<input type="email" value={data.email} disabled /></label><label className="field">Telefone (opcional)<input type="tel" maxLength={24} value={data.phone} onChange={event => setData({ ...data, phone: event.target.value })} /></label><p className="demo-note">Ao salvar, você autoriza armazenar estes dados no cadastro da Felcor.</p><button className="gold-button" disabled={busy}>{busy ? 'AGUARDE…' : 'SALVAR MEUS DADOS'}</button>{status && <p role="status" className="status">{status}</p>}</form><form action="/api/auth/logout" method="post"><button className="text-link">SAIR DA CONTA</button></form></main></>;
}
