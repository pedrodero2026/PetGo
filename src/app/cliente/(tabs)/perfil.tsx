import { ProfileScreen } from '@/components/ProfileScreen';

export default function ClienteProfile() {
  return (
    <ProfileScreen
      menu={[
        { icon: 'paw-outline', label: 'Meus pets', href: '/cliente/pets' },
        { icon: 'location-outline', label: 'Endereços', href: '/cliente/enderecos' },
        { icon: 'receipt-outline', label: 'Meus pedidos', href: '/cliente/pedidos' },
        { icon: 'refresh-circle-outline', label: 'Assinaturas', href: '/cliente/assinaturas' },
        { icon: 'heart-outline', label: 'Favoritos', href: '/cliente/favoritos' },
        { icon: 'chatbubbles-outline', label: 'Conversas', href: '/cliente/conversas' },
      ]}
    />
  );
}
