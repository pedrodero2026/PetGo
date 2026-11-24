import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors } from '@/theme';
import type { Pet, Species } from '@/types/models';

/** Foto do pet ou o ícone da espécie. */
export function PetAvatar({
  pet,
  species,
  size = 56,
}: {
  pet: Pick<Pet, 'photoUrl'>;
  species?: Species;
  size?: number;
}) {
  if (pet.photoUrl) {
    return <Image source={{ uri: pet.photoUrl }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <MaterialCommunityIcons
        name={(species?.icon ?? 'paw') as keyof typeof MaterialCommunityIcons.glyphMap}
        size={size * 0.55}
        color={colors.primary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
});
