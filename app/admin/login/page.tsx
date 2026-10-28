'use client';
import { useState, type FormEvent } from 'react';
export default function Login() {
  const [error,setError] = useState('');
  const [busy,setBusy] = useState(false);
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();setBusy(true);setError('');
    const fields = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:fields.get('email'),password:fields.get('password')})});
      const result = await response.json() as {error?: string};
      if (!response.ok) throw new Error(result.error);
      window.location.assign('/admin');
    } catch (reason) {setError(reason instanceof Error ? reason.message : 'Não foi possível entrar.');setBusy(false);}
  }
  return <main className="utility-page"><a href="/">← Voltar à loja</a><p className="eyebrow">FELCOR · ADMINISTRAÇÃO</p><h1>Entrar no painel</h1><form className="panel" onSubmit={login}><label className="field">E-mail<input name="email" type="email" required autoComplete="username" maxLength={254}/></label><label className="field">Senha<input name="password" type="password" required maxLength={128} autoComplete="current-password"/></label>{error && <p role="alert">{error}</p>}<button className="gold-button" disabled={busy}>{busy?'ENTRANDO…':'ENTRAR'}</button></form><p>Esqueceu a senha? O proprietário pode redefini-la com acesso à conta Cloudflare. A recuperação por e-mail ainda não está configurada.</p></main>;
}
