import { ComingSoon } from '@/components/ComingSoon';

export default function Screen() {
  return (
    <ComingSoon
      title="Pedidos da loja"
      description="Aceite ou recuse pedidos novos e atualize o status do preparo."
      phase={3}
      icon="clipboard-list-outline"
    />
  );
}
