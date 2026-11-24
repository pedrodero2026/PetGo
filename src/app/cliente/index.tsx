import { ComingSoon } from '@/components/ComingSoon';

export default function Screen() {
  return (
    <ComingSoon
      title="Lojas perto de você"
      description="Promoções, pet shops próximos e recomendações para os seus pets."
      phase={2}
      icon="storefront-outline"
    />
  );
}
