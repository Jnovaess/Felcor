export type Product = { id: string; name: string; category: string; description: string; price: number; stock: number; image: string; active: boolean };
export const demoProducts: Product[] = [
  { id: 'felcor-pasta-modeladora', name: 'Felcor Pomada Efeito Seco', category: 'Efeito seco', description: 'Ideal para quem busca um visual natural e moderno. Proporciona definição e textura aos fios, com acabamento matte, sem brilho, para um penteado estiloso no dia a dia.', price: 4990, stock: 0, image: '/assets/gold-jar.jpg', active: true },
  { id: 'felcor-toque-umido', name: 'Felcor Pomada Efeito Molhado', category: 'Efeito molhado', description: 'Para quem valoriza um visual elegante e sofisticado. Proporciona definição e acabamento com brilho, criando o efeito molhado ideal para penteados clássicos e alinhados.', price: 4990, stock: 0, image: '/assets/blue-jar.jpg', active: true },
  { id: 'felcor-kit-duo', name: 'Kit Felcor Duo', category: 'Kits', description: 'Dois estilos, infinitas possibilidades. O Kit Felcor Duo reúne o acabamento natural e matte do Efeito Seco com o brilho sofisticado do Efeito Molhado. Contém 1 pomada efeito seco e 1 pomada efeito molhado. Tenha versatilidade para criar diferentes penteados em qualquer ocasião.', price: 8990, stock: 0, image: '/assets/felcor-duo-studio.png', active: true },
];
export const galleries: Record<string, string[]> = {
  'felcor-pasta-modeladora': ['/assets/gold-open.jpg', '/assets/gold-texture.jpg'],
  'felcor-toque-umido': ['/assets/blue-open.jpg', '/assets/blue-texture.jpg'],
};
export const money = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100);
export const priceLabel = (value: number) => value > 0 ? money(value) : 'Preço a definir';
