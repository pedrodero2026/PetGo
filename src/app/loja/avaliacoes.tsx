import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { EmptyState, Loading } from '@/components/ui/States';
import { Stars } from '@/components/ui/Stars';
import { TextField } from '@/components/ui/TextField';
import { useAsync } from '@/hooks/useAsync';
import { catalogService, reviewService } from '@/services';
import { useAuth } from '@/store/auth';
import { colors, font, radius, shadow, spacing } from '@/theme';
import type { Review } from '@/types/models';
import { dateTimeLabel, ratingLabel } from '@/utils/format';

export default function StoreReviews() {
  const storeId = useAuth((s) => s.user!.storeId!);
  const { data, loading, reload } = useAsync(async () => {
    const [store, reviews] = await Promise.all([catalogService.getStore(storeId), reviewService.listByStore(storeId)]);
    return { store, reviews };
  }, [storeId]);

  if (loading || !data) return <Loading />;
  const { store, reviews } = data;
  const dist = [5, 4, 3, 2, 1].map((n) => ({ n, count: reviews.filter((r) => r.rating === n).length }));

  return (
    <FlatList
      data={reviews}
      keyExtractor={(r) => r.id}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        <View style={styles.summary}>
          <View style={styles.avg}>
            <Text style={styles.avgValue}>{ratingLabel(store?.rating ?? 0)}</Text>
            <Stars value={Math.round(store?.rating ?? 0)} size={16} />
            <Text style={styles.muted}>{store?.ratingCount ?? 0} avaliações</Text>
          </View>
          <View style={styles.flex}>
            {dist.map((d) => (
              <View key={d.n} style={styles.distRow}>
                <Text style={styles.muted}>{d.n}★</Text>
                <View style={styles.bar}>
                  <View style={[styles.fill, { width: `${reviews.length ? (d.count / reviews.length) * 100 : 0}%` }]} />
                </View>
              </View>
            ))}
          </View>
        </View>
      }
      ListEmptyComponent={<EmptyState icon="star-outline" title="Nenhuma avaliação ainda" />}
      renderItem={({ item }) => <ReviewCard review={item} onReplied={reload} />}
    />
  );
}

function ReviewCard({ review: r, onReplied }: { review: Review; onReplied: () => void }) {
  const [replying, setReplying] = useState(false);
  const [text, setText] = useState(r.reply ?? '');
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await reviewService.reply(r.id, text);
    setSaving(false);
    setReplying(false);
    onReplied();
  }

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.author}>{r.authorName}</Text>
        <Stars value={r.rating} size={14} />
      </View>
      {!!r.comment && <Text style={styles.comment}>{r.comment}</Text>}
      <Text style={styles.date}>{dateTimeLabel(r.createdAt)}</Text>
      {r.reply && !replying && (
        <View style={styles.reply}>
          <Text style={styles.replyLabel}>Sua resposta</Text>
          <Text style={styles.comment}>{r.reply}</Text>
        </View>
      )}
      {replying ? (
        <View style={{ gap: spacing.sm }}>
          <TextField label="Resposta" value={text} onChangeText={setText} multiline />
          <Button title="Publicar resposta" onPress={save} loading={saving} />
        </View>
      ) : (
        <Pressable onPress={() => setReplying(true)}>
          <Text style={styles.link}>{r.reply ? 'Editar resposta' : 'Responder'}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
  summary: { flexDirection: 'row', gap: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, ...shadow.card },
  avg: { alignItems: 'center', gap: 2 },
  avgValue: { fontSize: font.size.xxl, fontWeight: font.weight.black, color: colors.text },
  muted: { color: colors.textMuted, fontSize: font.size.xs },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, height: 16 },
  bar: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.warning },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: spacing.xs, ...shadow.card },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  author: { fontWeight: font.weight.bold, color: colors.text },
  comment: { color: colors.text, lineHeight: 20 },
  date: { color: colors.textMuted, fontSize: font.size.xs },
  reply: { backgroundColor: colors.secondaryLight, borderRadius: radius.md, padding: spacing.sm, marginTop: spacing.xs },
  replyLabel: { color: colors.secondary, fontWeight: font.weight.bold, fontSize: font.size.xs },
  link: { color: colors.primary, fontWeight: font.weight.bold, marginTop: spacing.xs },
});
