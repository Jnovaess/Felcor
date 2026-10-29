
import { money } from './catalog';

export function whatsappNumber(value?: string) {
  const digits = (value || '').replace(/[\s()+-]/g, '');
  return /^[1-9]\d{9,14}$/.test(digits) ? digits : null;
}

export function orderLink(
  phone: string,
  items: { name: string; price: number; quantity: number }[]
) {
  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const message = [
    '*Solicitação de Pedido*',
    '',
    'Olá! Gostaria de finalizar meu pedido com a Felcor Grooming.',
    '',
    '*Resumo do pedido:*',
    ...items.map(
      item =>
        `* ${item.quantity}x ${item.name} — ${money(item.price * item.quantity)}`
    ),
    '',
    `*Subtotal:* ${money(subtotal)}`,
    '*Frete:* A calcular',
    '',
    'Gostaria de confirmar a disponibilidade dos produtos, as opções de entrega e as formas de pagamento.',
    '',
    'Aguardo as informações para concluir minha compra. Obrigado!',
    '',
    '_Este pedido está sujeito à confirmação de disponibilidade e pagamento._',
  ].join('\n');

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

