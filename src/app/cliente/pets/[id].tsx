import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import { PetAvatar } from '@/components/PetAvatar';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Screen } from '@/components/ui/Screen';
import { Loading } from '@/components/ui/States';
import { TextField } from '@/components/ui/TextField';
import { useAsync } from '@/hooks/useAsync';
import { catalogService, petService } from '@/services';
import { useAuth } from '@/store/auth';
import { colors, font, spacing } from '@/theme';
import type { Pet, PetSize, Species } from '@/types/models';
import { confirm } from '@/utils/confirm';
import { maskDate, parseBrDate, toBrDate } from '@/utils/format';
import { sizeHints, sizeLabels } from '@/utils/pets';
import { goBack } from '@/utils/navigation';

/** Sugere o porte a partir do peso, para facilitar o preenchimento. */
function sizeFromWeight(kg: number): PetSize {
  if (kg <= 5) return 'mini';
  if (kg <= 10) return 'pequeno';
  if (kg <= 25) return 'medio';
  if (kg <= 45) return 'grande';
  return 'gigante';
}

export default function PetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'novo';
  const { data, loading } = useAsync(async () => {
    const [species, pet] = await Promise.all([catalogService.listSpecies(), isNew ? null : petService.get(id)]);
    return { species, pet };
  }, [id]);

  if (loading || !data) return <Loading />;
  return <PetForm key={id} id={id} isNew={isNew} pet={data.pet} species={data.species} />;
}

interface FormProps {
  id: string;
  isNew: boolean;
  pet: Pet | null;
  species: Species[];
}

/** O formulário só é montado com os dados já carregados, então o estado inicial vem direto do pet. */
function PetForm({ id, isNew, pet, species: speciesList }: FormProps) {
  const userId = useAuth((s) => s.user!.id);

  const [name, setName] = useState(pet?.name ?? '');
  const [speciesId, setSpeciesId] = useState(pet?.speciesId ?? 'cachorro');
  const [breed, setBreed] = useState(pet?.breed ?? '');
  const [weight, setWeight] = useState(pet ? String(pet.weightKg).replace('.', ',') : '');
  const [size, setSize] = useState<PetSize>(pet?.size ?? 'medio');
  const [sizeTouched, setSizeTouched] = useState(!!pet);
  const [birth, setBirth] = useState(toBrDate(pet?.birthDate));
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(pet?.photoUrl);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function onWeight(text: string) {
    setWeight(text);
    const kg = Number(text.replace(',', '.'));
    if (!sizeTouched && kg > 0) setSize(sizeFromWeight(kg));
  }

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });
    if (!result.canceled) setPhotoUrl(result.assets[0].uri);
  }

  async function save() {
    const e: Record<string, string> = {};
    const kg = Number(weight.replace(',', '.'));
    if (!name.trim()) e.name = 'Informe o nome do pet.';
    if (!(kg > 0 && kg < 150)) e.weight = 'Informe um peso válido.';
    const birthDate = birth ? parseBrDate(birth) : undefined;
    if (birth && !birthDate) e.birth = 'Data inválida. Use dd/mm/aaaa.';
    setErrors(e);
    if (Object.keys(e).length) return;

    setSaving(true);
    await petService.save({
      id: isNew ? undefined : id,
      ownerId: userId,
      name: name.trim(),
      speciesId,
      breed: breed.trim() || undefined,
      size,
      weightKg: kg,
      birthDate,
      photoUrl,
    });
    goBack('/cliente/pets');
  }

  async function remove() {
    if (await confirm('Remover pet', `Deseja remover ${name}?`, 'Remover')) {
      await petService.remove(id);
      goBack('/cliente/pets');
    }
  }

  const species = speciesList.find((s) => s.id === speciesId);

  return (
    <Screen scroll edges={['bottom']}>
      <Stack.Screen options={{ title: isNew ? 'Novo pet' : 'Editar pet' }} />

      <Pressable style={styles.photo} onPress={pickPhoto}>
        <PetAvatar pet={{ photoUrl }} species={species} size={104} />
        <View style={styles.camera}>
          <Ionicons name="camera" size={18} color={colors.textOnPrimary} />
        </View>
      </Pressable>

      <TextField label="Nome" icon="paw-outline" placeholder="Ex.: Thor" value={name} onChangeText={setName} error={errors.name} />

      <View style={styles.group}>
        <Text style={styles.label}>Espécie</Text>
        <View style={styles.chips}>
          {speciesList.map((s) => (
            <Chip
              key={s.id}
              label={s.name}
              icon={s.icon as never}
              selected={speciesId === s.id}
              onPress={() => setSpeciesId(s.id)}
            />
          ))}
        </View>
      </View>

      <TextField label="Raça (opcional)" icon="ribbon-outline" placeholder="Ex.: Labrador, SRD" value={breed} onChangeText={setBreed} />

      <TextField
        label="Peso (kg)"
        icon="scale-outline"
        keyboardType="decimal-pad"
        placeholder="Ex.: 12,5"
        value={weight}
        onChangeText={onWeight}
        error={errors.weight}
      />

      <View style={styles.group}>
        <Text style={styles.label}>Porte</Text>
        <View style={styles.chips}>
          {(Object.keys(sizeLabels) as PetSize[]).map((s) => (
            <Chip
              key={s}
              label={`${sizeLabels[s]} (${sizeHints[s]})`}
              selected={size === s}
              onPress={() => {
                setSize(s);
                setSizeTouched(true);
              }}
            />
          ))}
        </View>
      </View>

      <TextField
        label="Data de nascimento (opcional)"
        icon="calendar-outline"
        keyboardType="number-pad"
        placeholder="dd/mm/aaaa"
        value={birth}
        onChangeText={(t) => setBirth(maskDate(t))}
        error={errors.birth}
      />
      <Text style={styles.hint}>
        Usamos espécie, porte, peso e idade para recomendar a ração certa e calcular quando ela vai acabar.
      </Text>

      <Button title="Salvar" onPress={save} loading={saving} />
      {!isNew && <Button title="Remover pet" variant="ghost" onPress={remove} />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  photo: { alignSelf: 'center', marginBottom: spacing.sm },
  camera: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  group: { gap: spacing.xs },
  label: { fontSize: font.size.sm, fontWeight: font.weight.medium, color: colors.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  hint: { color: colors.textMuted, fontSize: font.size.xs, lineHeight: 18 },
});
