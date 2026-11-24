import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { colors, font, radius, spacing } from '@/theme';
import { cancelReasons } from '@/utils/orders';

interface Props {
  title: string;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void> | void;
}

/** Pergunta o motivo antes de recusar/cancelar um pedido. Montar só quando for aberto. */
export function CancelOrderModal({ title, onClose, onConfirm }: Props) {
  const [reason, setReason] = useState(cancelReasons[0]);
  const [other, setOther] = useState('');
  const [sending, setSending] = useState(false);
  const isOther = reason === 'Outro motivo';

  async function confirm() {
    setSending(true);
    try {
      await onConfirm(isOther ? other.trim() || reason : reason);
    } finally {
      setSending(false);
    }
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.desc}>O cliente verá o motivo. Os produtos voltam para o estoque.</Text>
          {cancelReasons.map((r) => (
            <Pressable key={r} style={styles.option} onPress={() => setReason(r)}>
              <Ionicons
                name={reason === r ? 'radio-button-on' : 'radio-button-off'}
                size={22}
                color={reason === r ? colors.primary : colors.textMuted}
              />
              <Text style={styles.optionText}>{r}</Text>
            </Pressable>
          ))}
          {isOther && <TextField label="Qual o motivo?" value={other} onChangeText={setOther} />}
          <View style={styles.actions}>
            <Button title="Voltar" variant="outline" onPress={onClose} style={styles.flex} />
            <Button title="Confirmar" onPress={confirm} loading={sending} style={[styles.flex, styles.danger]} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: spacing.lg },
  sheet: { backgroundColor: colors.background, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm },
  title: { fontSize: font.size.lg, fontWeight: font.weight.bold, color: colors.text },
  desc: { color: colors.textMuted, fontSize: font.size.sm, marginBottom: spacing.xs },
  option: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 6 },
  optionText: { color: colors.text, fontSize: font.size.md },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  danger: { backgroundColor: colors.danger },
});
