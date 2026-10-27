export type Product = { id: string; name: string; category: string; description: string; price: number; stock: number; image: string; active: boolean };
export const demoProducts: Product[] = [
  { id: 'felcor-pasta-modeladora', name: 'Felcor Pasta Modeladora', category: 'Pomadas', description: 'Pasta modeladora para cabelo · 100 g. Dê forma ao seu estilo e faça do acabamento a sua marca. Embalagem preta com detalhes dourados.', price: 0, stock: 0, image: '/assets/gold-jar.jpg', active: true },
  { id: 'felcor-toque-umido', name: 'Felcor Toque Úmido', category: 'Toque úmido', description: 'Pasta modeladora toque úmido · 100 g. Um toque de atitude na finalização do seu cabelo. Embalagem preta com detalhes azuis.', price: 0, stock: 0, image: '/assets/blue-jar.jpg', active: true },
];
export const galleries: Record<string, string[]> = {
  'felcor-pasta-modeladora': ['/assets/gold-open.jpg', '/assets/gold-texture.jpg'],
  'felcor-toque-umido': ['/assets/blue-open.jpg', '/assets/blue-texture.jpg'],
};
export const money = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100);
export const priceLabel = (value: number) => value > 0 ? money(value) : 'Preço a definir';
