type CheckoutTab = { opener: unknown; closed: boolean; close:()=>void; location:{replace:(url:string)=>void} };
export function openCheckoutTab(open:()=>CheckoutTab|null) {
  const tab=open();
  if(!tab) throw new Error('Seu navegador bloqueou a nova aba. Permita pop-ups para esta loja e tente novamente.');
  tab.opener=null;
  return {
    navigate(url:string) {
      if(tab.closed) throw new Error('A aba de atendimento foi fechada. Tente novamente.');
      tab.location.replace(url);
    },
    cancel(){if(!tab.closed)tab.close();},
    get closed(){return tab.closed;},
  };
}
