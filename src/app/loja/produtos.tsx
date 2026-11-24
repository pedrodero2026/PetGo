import { ComingSoon } from '@/components/ComingSoon';

export default function Screen() {
  return (
    <ComingSoon
      title="Meus produtos"
      description="Cadastre produtos com fotos, estoque, espécie, porte e idade."
      phase={3}
      icon="package-variant"
    />
  );
}
