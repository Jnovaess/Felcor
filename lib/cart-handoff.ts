export function handoffCart(url: string, actions: {clearStorage:()=>void;clearCart:()=>void;navigate:(url:string)=>void}) {
  const target=new URL(url);
  if(target.origin!=='https://wa.me') throw new Error('Endereço de atendimento inválido.');
  actions.clearStorage();
  actions.clearCart();
  actions.navigate(target.href);
}
