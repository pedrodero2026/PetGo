import { ComingSoon } from '@/components/ComingSoon';

export default function Screen() {
  return (
    <ComingSoon
      title="Entregas disponíveis"
      description="Aceite entregas, veja a rota no mapa e confirme a entrega."
      phase={4}
      icon="moped-outline"
    />
  );
}
