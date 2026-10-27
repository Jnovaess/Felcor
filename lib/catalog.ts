export type Product = { id: string; name: string; category: string; description: string; price: number; stock: number; image: string; active: boolean };
export const demoProducts: Product[] = [
  { id: 'matte-clay', name: 'Matte Clay Baboon', category: 'Cabelo', description: 'Pasta modeladora · 80 g. Item de referência para apresentação do catálogo.', price: 9800, stock: 10, image: '/assets/matte.png', active: true },
  { id: 'leave-in', name: 'Leave-in Baboon', category: 'Cabelo', description: 'Finalizador · 240 ml. Item de referência para apresentação do catálogo.', price: 9600, stock: 10, image: '/assets/leave-in.jpg', active: true },
  { id: 'grooming', name: 'Grooming Baboon', category: 'Cabelo', description: 'Modelador · 240 ml. Item de referência para apresentação do catálogo.', price: 9000, stock: 10, image: '/assets/grooming.jpg', active: true },
  { id: 'balm', name: 'Balm Baboon', category: 'Barba', description: 'Cuidado para a barba · 140 ml. Item de referência para apresentação do catálogo.', price: 7300, stock: 10, image: '/assets/balm.jpg', active: true },
  { id: 'kit-estilo', name: 'Kit Styling', category: 'Kits', description: 'Grooming + Matte Clay. Composição ilustrativa para apresentação.', price: 16920, stock: 10, image: '/assets/grooming.jpg', active: true },
  { id: 'kit-rotina', name: 'Kit Rotina Essencial', category: 'Kits', description: 'Leave-in + Matte Clay. Composição ilustrativa para apresentação.', price: 17460, stock: 10, image: '/assets/leave-in.jpg', active: true },
];
export const money = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100);
