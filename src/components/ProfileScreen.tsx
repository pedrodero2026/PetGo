import { Alert, Platform, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { useAuth } from '@/store/auth';
import { colors, font, radius, shadow, spacing } from '@/theme';

const roleLabel = { cliente: 'Cliente', loja: 'Loja parceira', entregador: 'Entregador' } as const;

/** Tela de perfil compartilhada pelos três perfis. */
export function ProfileScreen() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  if (!user) return null;

  const confirmLogout = () => {
    // Alert com botões não funciona no navegador; lá saímos direto.
    if (Platform.OS === 'web') return void logout();
    Alert.alert('Sair', 'Deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  };

  const initials = user.name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Screen scroll edges={['bottom']}>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>{initials}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.role}>{roleLabel[user.role]}</Text>
      </View>

      <View style={styles.card}>
        <Info icon="mail-outline" label="E-mail" value={user.email} />
        {!!user.phone && <Info icon="call-outline" label="Telefone" value={user.phone} />}
        {user.vehicle && <Info icon="bicycle-outline" label="Veículo" value={user.vehicle} />}
      </View>

      <Button title="Sair da conta" variant="outline" icon="log-out-outline" onPress={confirmLogout} />
    </Screen>
  );
}

function Info({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.info}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <View>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadow.card,
  },
  avatar: {
    alignSelf: 'center',
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { color: colors.textOnPrimary, fontSize: font.size.xl, fontWeight: font.weight.bold },
  name: { textAlign: 'center', fontSize: font.size.lg, fontWeight: font.weight.bold, color: colors.text, marginTop: -4 },
  role: { textAlign: 'center', color: colors.textMuted, marginTop: -12 },
  info: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  infoLabel: { fontSize: font.size.xs, color: colors.textMuted },
  infoValue: { fontSize: font.size.md, color: colors.text, textTransform: 'none' },
});
