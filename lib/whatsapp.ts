import { money } from './catalog';

export function whatsappNumber(value?: string) {
  const digits = (value || '').replace(/[\s()+-]/g, '');
  return /^[1-9]\d{9,14}$/.test(digits) ? digits : null;
}

export function orderLink(phone: string, items: { name: string; price: number; quantity: number }[]) {
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const message = [
    'Olá! Gostaria de combinar o pagamento deste pedido da Felcor Grooming:',
    '',
    ...items.map(item => `${item.quantity} × ${item.name} — ${money(item.price)} cada — ${money(item.price * item.quantity)}`),
    '',
    `Subtotal dos produtos: ${money(subtotal)}`,
    'Frete não incluído. Por favor, confirme disponibilidade, entrega e forma de pagamento.',
    'Esta mensagem é uma solicitação de compra, sem pagamento ou reserva de estoque realizados.',
  ].join('\n');
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
