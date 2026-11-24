import { ProfileScreen } from '@/components/ProfileScreen';

export default function LojaProfile() {
  return (
    <ProfileScreen
      menu={[
        { icon: 'pricetags-outline', label: 'Cupons', href: '/loja/cupons' },
        { icon: 'star-outline', label: 'Avaliações', href: '/loja/avaliacoes' },
      ]}
    />
  );
}
