import type { Product } from './catalog';
export const DUO_ID = 'felcor-kit-duo';
export const DUO_COMPONENTS = ['felcor-pasta-modeladora', 'felcor-toque-umido'];
export function catalogAvailability(rows: Product[]) {
  const available = DUO_COMPONENTS.map(id => rows.find(p=>p.id===id && p.active)?.stock ?? 0);
  return rows.map(p=>p.id===DUO_ID ? {...p,stock:Math.min(...available)} : p);
}
export function enoughStock(rows: Product[], items: {id:string;quantity:number}[]) {
  const required=new Map<string,number>();
  for(const item of items) for(const id of item.id===DUO_ID ? DUO_COMPONENTS : [item.id]) required.set(id,(required.get(id)||0)+item.quantity);
  return [...required].every(([id,quantity])=>rows.some(p=>p.id===id && p.active && p.stock>=quantity));
}
