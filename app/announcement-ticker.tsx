'use client';

import { ArrowUpRight, ShoppingBag, Package, Truck } from 'lucide-react';
import { wholesaleLink, INSTAGRAM_URL } from '@/lib/contact';
import { track } from '@/lib/track';

export default function AnnouncementTicker() {
  return <div className="store-ticker" aria-label="Informações da Felcor">
    <span className="ticker-badge">NOVIDADES</span>
    <div className="ticker-window">
      <div className="ticker-track">
        {[0, 1].map(copy => <div className="ticker-group" key={copy} aria-hidden={copy === 1 ? true : undefined}>
          <span><ShoppingBag size={21} aria-hidden="true" /> Pomadas para o seu estilo · Efeito seco ou molhado</span>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" tabIndex={copy === 1 ? -1 : undefined}>
            <img src="/assets/instagram.svg" width={21} height={21} alt="" /> @felcorgrooming <ArrowUpRight size={15} aria-hidden="true" />
          </a>
          <a href={wholesaleLink} onClick={() => track('reseller')} target="_blank" rel="noopener noreferrer" tabIndex={copy === 1 ? -1 : undefined}>
            Revenda: mínimo 10 unidades <span className="ticker-cta">Saiba mais <ArrowUpRight size={16} aria-hidden="true" /></span>
          </a>
          <span><Package size={21} aria-hidden="true" /> Kit Felcor Duo · Dois estilos, infinitas possibilidades</span>
          <span><Truck size={21} aria-hidden="true" /> Pagamento e entrega · Combine pelo WhatsApp</span>
        </div>)}
      </div>
    </div>
  </div>;
}
