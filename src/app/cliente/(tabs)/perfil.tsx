import { ProfileScreen } from '@/components/ProfileScreen';

export default function ClienteProfile() {
  return (
    <ProfileScreen
      menu={[
        { icon: 'paw-outline', label: 'Meus pets', href: '/cliente/pets' },
        { icon: 'location-outline', label: 'Endereços', href: '/cliente/enderecos' },
        { icon: 'receipt-outline', label: 'Meus pedidos', href: '/cliente/pedidos' },
      ]}
    />
  );
}
