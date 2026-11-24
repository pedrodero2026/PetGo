import { ComingSoon } from '@/components/ComingSoon';

export default function Screen() {
  return (
    <ComingSoon
      title="Buscar produtos"
      description="Busque por marca, espécie, porte, idade, preço e peso do pacote."
      phase={2}
      icon="magnify"
    />
  );
}
