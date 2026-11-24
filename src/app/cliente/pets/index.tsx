import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { PetAvatar } from '@/components/PetAvatar';
import { Button } from '@/components/ui/Button';
import { EmptyState, Loading } from '@/components/ui/States';
import { useAsync } from '@/hooks/useAsync';
import { useFoodStatuses } from '@/hooks/useFoodStatuses';
import { catalogService, petService } from '@/services';
import { useAuth } from '@/store/auth';
import { colors, font, radius, shadow, spacing } from '@/theme';
import { ageLabel, lifeStageLabels, lifeStageOf, sizeLabels } from '@/utils/pets';

export default function Pets() {
  const userId = useAuth((s) => s.user!.id);
  const { data, loading } = useAsync(async () => {
    const [pets, species] = await Promise.all([petService.list(userId), catalogService.listSpecies()]);
    return { pets, species };
  }, [userId]);

  const { statuses } = useFoodStatuses(userId);

  if (loading || !data) return <Loading />;

  return (
    <FlatList
      data={data.pets}
      keyExtractor={(p) => p.id}
      contentContainerStyle={styles.list}
      ListEmptyComponent={
        <EmptyState
          icon="dog-side"
          title="Nenhum pet cadastrado"
          description="Cadastre seus pets para receber recomendações de ração e lembretes de recompra."
        />
      }
      ListFooterComponent={
        <Button title="Adicionar pet" icon="add" onPress={() => router.push('/cliente/pets/novo')} style={{ marginTop: spacing.md }} />
      }
      renderItem={({ item: pet }) => {
        const species = data.species.find((s) => s.id === pet.speciesId);
        const age = ageLabel(pet.birthDate);
        return (
          <Pressable style={styles.card} onPress={() => router.push(`/cliente/pets/${pet.id}`)}>
            <PetAvatar pet={pet} species={species} />
            <View style={styles.flex}>
              <Text style={styles.name}>{pet.name}</Text>
              <Text style={styles.muted}>
                {species?.name ?? pet.speciesId}
                {pet.breed ? ` · ${pet.breed}` : ''}
              </Text>
              <Text style={styles.muted}>
                {sizeLabels[pet.size]} · {String(pet.weightKg).replace('.', ',')} kg
                {age ? ` · ${age}` : ''} · {lifeStageLabels[lifeStageOf(pet)]}
              </Text>
              <FoodLine days={statuses.find((st) => st.pet.id === pet.id)?.daysLeft} />
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </Pressable>
        );
      }}
    />
  );
}

/** "Ração: ~7 dias restantes" (ou convite para informar o pacote). */
function FoodLine({ days }: { days?: number }) {
  if (days === undefined) return <Text style={styles.foodMuted}>Ração: informe o pacote para receber lembretes</Text>;
  const color = days <= 3 ? colors.danger : days <= 10 ? colors.warning : colors.success;
  return (
    <Text style={[styles.food, { color }]}>
      Ração: {days === 0 ? 'acabou' : `~${days} ${days === 1 ? 'dia restante' : 'dias restantes'}`}
    </Text>
  );
}

const styles = StyleSheet.create({
  food: { fontSize: font.size.xs, fontWeight: font.weight.bold, marginTop: 2 },
  foodMuted: { fontSize: font.size.xs, color: colors.textMuted, marginTop: 2 },
  flex: { flex: 1 },
  list: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    ...shadow.card,
  },
  name: { fontSize: font.size.md, fontWeight: font.weight.bold, color: colors.text },
  muted: { color: colors.textMuted, fontSize: font.size.sm },
});
