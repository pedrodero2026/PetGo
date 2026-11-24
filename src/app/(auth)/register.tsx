import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { useAuth } from '@/store/auth';
import { colors, font, radius, spacing } from '@/theme';
import type { Role, User } from '@/types/models';

const roles: { id: Role; title: string; desc: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { id: 'cliente', title: 'Sou tutor', desc: 'Quero comprar para meu pet', icon: 'paw' },
  { id: 'loja', title: 'Sou loja', desc: 'Quero vender no PetGo', icon: 'storefront-outline' },
  { id: 'entregador', title: 'Sou entregador', desc: 'Quero fazer entregas', icon: 'moped-outline' },
];

const vehicles: NonNullable<User['vehicle']>[] = ['moto', 'bicicleta', 'carro'];

export default function Register() {
  const register = useAuth((s) => s.register);

  const [role, setRole] = useState<Role>('cliente');
  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [vehicle, setVehicle] = useState<User['vehicle']>('moto');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (name.trim().length < 3) e.name = 'Informe seu nome completo.';
    if (role === 'loja' && storeName.trim().length < 2) e.storeName = 'Informe o nome da loja.';
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) e.email = 'E-mail inválido.';
    if (password.length < 6) e.password = 'A senha precisa ter pelo menos 6 caracteres.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    if (!validate()) return;
    setLoading(true);
    try {
      await register({ name, email, password, phone, role, storeName, vehicle });
    } catch (e) {
      setErrors({ form: e instanceof Error ? e.message : 'Algo deu errado.' });
      setLoading(false);
    }
  }

  return (
    <Screen scroll edges={['bottom']}>
      <Text style={styles.section}>Como você vai usar o PetGo?</Text>
      <View style={styles.roles}>
        {roles.map((r) => {
          const active = r.id === role;
          return (
            <Pressable
              key={r.id}
              onPress={() => setRole(r.id)}
              style={[styles.role, active && styles.roleActive]}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}>
              <MaterialCommunityIcons name={r.icon} size={28} color={active ? colors.primary : colors.textMuted} />
              <Text style={[styles.roleTitle, active && { color: colors.primaryDark }]}>{r.title}</Text>
              <Text style={styles.roleDesc}>{r.desc}</Text>
            </Pressable>
          );
        })}
      </View>

      <TextField label="Nome completo" icon="person-outline" value={name} onChangeText={setName} error={errors.name} />

      {role === 'loja' && (
        <TextField
          label="Nome da loja"
          icon="storefront-outline"
          value={storeName}
          onChangeText={setStoreName}
          error={errors.storeName}
        />
      )}

      {role === 'entregador' && (
        <View style={{ gap: spacing.xs }}>
          <Text style={styles.label}>Veículo</Text>
          <View style={styles.vehicles}>
            {vehicles.map((v) => (
              <Pressable
                key={v}
                onPress={() => setVehicle(v)}
                style={[styles.vehicle, vehicle === v && styles.vehicleActive]}>
                <Text style={[styles.vehicleText, vehicle === v && { color: colors.textOnPrimary }]}>{v}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      <TextField
        label="E-mail"
        icon="mail-outline"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
      />
      <TextField
        label="Telefone (opcional)"
        icon="call-outline"
        keyboardType="phone-pad"
        placeholder="(11) 99999-9999"
        value={phone}
        onChangeText={setPhone}
      />
      <TextField
        label="Senha"
        icon="lock-closed-outline"
        password
        value={password}
        onChangeText={setPassword}
        error={errors.password}
      />

      {!!errors.form && <Text style={styles.error}>{errors.form}</Text>}

      <Button title="Criar conta" onPress={submit} loading={loading} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { fontSize: font.size.md, fontWeight: font.weight.bold, color: colors.text },
  roles: { flexDirection: 'row', gap: spacing.sm },
  role: {
    flex: 1,
    padding: spacing.sm + 2,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    gap: 2,
  },
  roleActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  roleTitle: { fontSize: font.size.sm, fontWeight: font.weight.bold, color: colors.text, marginTop: 4 },
  roleDesc: { fontSize: 11, color: colors.textMuted, textAlign: 'center' },
  label: { fontSize: font.size.sm, fontWeight: font.weight.medium, color: colors.text },
  vehicles: { flexDirection: 'row', gap: spacing.sm },
  vehicle: {
    flex: 1,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  vehicleText: { color: colors.text, fontWeight: font.weight.medium, textTransform: 'capitalize' },
  error: { color: colors.danger, fontSize: font.size.sm },
});
