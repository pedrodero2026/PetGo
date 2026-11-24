import { ComingSoon } from '@/components/ComingSoon';

export default function Screen() {
  return (
    <ComingSoon
      title="Meus pedidos"
      description="Acompanhe pedidos em andamento e peça de novo com um toque."
      phase={2}
      icon="receipt-text-outline"
    />
  );
}
