import type { OrderStatus, PaymentMethod } from '@/types/models';

export const statusInfo: Record<OrderStatus, { label: string; desc: string; color: string; icon: string }> = {
  aguardando: { label: 'Aguardando a loja', desc: 'A loja vai confirmar seu pedido em instantes.', color: '#F2B705', icon: 'timer-sand' },
  aceito: { label: 'Pedido aceito', desc: 'A loja confirmou seu pedido.', color: '#3C7DD9', icon: 'check-circle-outline' },
  preparando: { label: 'Separando os produtos', desc: 'A loja está preparando seu pedido.', color: '#3C7DD9', icon: 'package-variant' },
  pronto: { label: 'Pronto para entrega', desc: 'Aguardando o entregador retirar.', color: '#3C7DD9', icon: 'package-variant-closed-check' },
  a_caminho: { label: 'Saiu para entrega', desc: 'O entregador está a caminho.', color: '#FF7A00', icon: 'moped' },
  entregue: { label: 'Entregue', desc: 'Seu pet agradece! 🐾', color: '#2E9E5B', icon: 'home-heart' },
  cancelado: { label: 'Cancelado', desc: 'Este pedido foi cancelado.', color: '#D64545', icon: 'close-circle-outline' },
};

/** Ordem das etapas exibidas na linha do tempo. */
export const statusFlow: OrderStatus[] = ['aguardando', 'aceito', 'preparando', 'pronto', 'a_caminho', 'entregue'];

export const isActive = (s: OrderStatus) => s !== 'entregue' && s !== 'cancelado';

export const paymentLabels: Record<PaymentMethod, string> = {
  pix: 'Pix',
  cartao: 'Cartão de crédito',
  dinheiro: 'Dinheiro na entrega',
};

/** Próximo passo que a loja pode dar em um pedido. */
export function storeNextStep(status: OrderStatus): { status: OrderStatus; label: string } | undefined {
  switch (status) {
    case 'aguardando':
      return { status: 'aceito', label: 'Aceitar pedido' };
    case 'aceito':
      return { status: 'preparando', label: 'Começar a separar' };
    case 'preparando':
      return { status: 'pronto', label: 'Pronto para entrega' };
    default:
      return undefined;
  }
}

/** A loja ainda pode cancelar/recusar enquanto o pedido não saiu. */
export const storeCanCancel = (s: OrderStatus) => s === 'aguardando' || s === 'aceito' || s === 'preparando';

export const cancelReasons = [
  'Produto sem estoque',
  'Loja fechando',
  'Endereço fora da área de entrega',
  'Pedido duplicado',
  'Outro motivo',
];
