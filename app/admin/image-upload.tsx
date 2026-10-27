'use client';
import { useState } from 'react';
import { MAX_IMAGE_BYTES } from '@/lib/images';

export default function ImageUpload({ initial, onBusy }: { initial: string; onBusy: (value: boolean) => void }) {
  const [url, setUrl] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  async function upload(file?: File) {
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > MAX_IMAGE_BYTES) { setStatus('Escolha uma imagem PNG, JPEG ou WebP de até 5 MB.'); return; }
    setBusy(true); onBusy(true); setStatus('Enviando imagem…');
    try {
      const form = new FormData(); form.set('image', file);
      const response = await fetch('/api/images', { method: 'POST', body: form });
      const data = await response.json() as { url?: string; error?: string };
      if (!response.ok || !data.url) throw new Error(data.error || 'Falha no envio.');
      setUrl(data.url); setStatus('Imagem enviada. Clique em Salvar produto para aplicar.');
    } catch (reason) { setStatus(reason instanceof Error ? reason.message : 'Falha no envio. Tente novamente.'); }
    finally { setBusy(false); onBusy(false); }
  }
  return <fieldset className="image-upload"><legend>Imagem do produto</legend><div className="image-upload-layout"><img src={url} alt="Prévia da imagem do produto" /><div><label className="field">Adicionar imagem do computador<input type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={event => { void upload(event.target.files?.[0]); event.target.value = ''; }} /></label><p className="demo-note">PNG, JPEG ou WebP · até 5 MB. Aguarde o envio antes de salvar.</p><label className="field">Ou usar um endereço de imagem<input name="image" required maxLength={2000} value={url} disabled={busy} onChange={event => setUrl(event.target.value)} /></label></div></div>{status && <p role="status" className="status">{status}</p>}</fieldset>;
}
