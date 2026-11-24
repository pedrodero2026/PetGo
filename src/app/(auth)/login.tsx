import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { demoUsers } from '@/data/seed';
import { useAuth } from '@/store/auth';
import { colors, font, radius, spacing } from '@/theme';

export default function Login() {
  const login = useAuth((s) => s.login);
  const loginWithGoogle = useAuth((s) => s.loginWithGoogle);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Ao logar, o layout de (auth) redireciona para a área do perfil.
  async function run(action: () => Promise<void>) {
    setError('');
    setLoading(true);
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Algo deu errado.');
      setLoading(false);
    }
  }

  const submit = () => {
    if (!email || !password) return setError('Preencha e-mail e senha.');
    run(() => login(email, password));
  };

  return (
    <Screen scroll edges={['bottom']}>
      <Text style={styles.title}>Que bom te ver de novo! 🐾</Text>

      <TextField
        label="E-mail"
        icon="mail-outline"
        placeholder="voce@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        value={email}
        onChangeText={setEmail}
      />
      <TextField
        label="Senha"
        icon="lock-closed-outline"
        placeholder="Sua senha"
        password
        value={password}
        onChangeText={setPassword}
        onSubmitEditing={submit}
      />

      {!!error && <Text style={styles.error}>{error}</Text>}

      <Button title="Entrar" onPress={submit} loading={loading} />

      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.or}>ou</Text>
        <View style={styles.line} />
      </View>

      <Button
        title="Continuar com Google"
        variant="outline"
        icon="logo-google"
        onPress={() => run(loginWithGoogle)}
        disabled={loading}
      />

      <Text style={styles.footer}>
        Não tem conta?{' '}
        <Link href="/register" replace style={styles.link}>
          Cadastre-se
        </Link>
      </Text>

      {/* Atalhos para testar e apresentar o app enquanto usamos dados fictícios */}
      <View style={styles.demo}>
        <Text style={styles.demoTitle}>Contas de demonstração (senha 123456)</Text>
        <View style={styles.demoRow}>
          {demoUsers.map((u) => (
            <Pressable
              key={u.id}
              style={styles.chip}
              onPress={() => {
                setEmail(u.email);
                setPassword(u.password);
              }}>
              <Text style={styles.chipText}>{u.role}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: font.size.xl, fontWeight: font.weight.bold, color: colors.text, marginBottom: spacing.sm },
  error: { color: colors.danger, fontSize: font.size.sm },
  divider: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  or: { color: colors.textMuted },
  footer: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.sm },
  link: { color: colors.primary, fontWeight: font.weight.bold },
  demo: {
    marginTop: 'auto',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.secondaryLight,
    gap: spacing.sm,
  },
  demoTitle: { fontSize: font.size.xs, color: colors.secondary, fontWeight: font.weight.bold },
  demoRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  chipText: { color: colors.secondary, fontWeight: font.weight.medium, textTransform: 'capitalize' },
});
