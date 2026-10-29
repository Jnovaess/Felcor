'use client';

import { useState } from 'react';
import { Pause, Play, ArrowUpRight } from 'lucide-react';
import { wholesaleLink, INSTAGRAM_URL } from '@/lib/contact';
import { track } from '@/lib/track';

export default function AnnouncementTicker() {
  const [paused, setPaused] = useState(false);
  return <div className="store-ticker" aria-label="Informações da Felcor">
    <div className="ticker-window">
      <div className={`ticker-track${paused ? ' ticker-paused' : ''}`}>
        {[0, 1].map(copy => <div className="ticker-group" key={copy} aria-hidden={copy === 1 ? true : undefined}>
          <a href={wholesaleLink} onClick={() => track('reseller')} target="_blank" rel="noopener noreferrer" tabIndex={copy === 1 ? -1 : undefined}>
            <strong>SEJA REVENDEDOR FELCOR</strong> · Pedido mínimo de 10 unidades <ArrowUpRight size={16} aria-hidden="true" />
          </a>
          <span>EFEITO SECO OU MOLHADO · Encontre o seu estilo</span>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" tabIndex={copy === 1 ? -1 : undefined}>
            <img src="/assets/instagram.svg" width={17} height={17} alt="" /> SIGA @felcorgrooming NO INSTAGRAM <ArrowUpRight size={16} aria-hidden="true" />
          </a>
          <span>KIT FELCOR DUO · Dois estilos, infinitas possibilidades</span>
          <span>PAGAMENTO E ENTREGA · Combine pelo WhatsApp</span>
        </div>)}
      </div>
    </div>
    <button className="ticker-toggle" onClick={() => setPaused(!paused)} aria-label={paused ? 'Retomar faixa de informações' : 'Pausar faixa de informações'} aria-pressed={paused}>
      {paused ? <Play size={17} aria-hidden="true" /> : <Pause size={17} aria-hidden="true" />}
    </button>
  </div>;
}
