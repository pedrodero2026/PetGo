import { StyleSheet, View, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { categories } from '@/data/seed';
import { colors, radius } from '@/theme';
import type { CategoryId } from '@/types/models';

/** Cor de fundo do placeholder por categoria. */
const tint: Record<CategoryId, string> = {
  racao: '#FFE7D1',
  petiscos: '#FBE3E0',
  higiene: '#DFF1F7',
  brinquedos: '#E6F4DF',
  remedios: '#ECE5F7',
};

interface Props {
  categoryId: CategoryId;
  imageUrl?: string;
  size: number;
  style?: ViewStyle;
}

/** Foto do produto ou, sem foto, o ícone da categoria em um fundo colorido. */
export function ProductImage({ categoryId, imageUrl, size, style }: Props) {
  const icon = categories.find((c) => c.id === categoryId)?.icon ?? 'paw';
  return (
    <View style={[styles.box, { width: size, height: size, backgroundColor: tint[categoryId] }, style]}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <MaterialCommunityIcons
          name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
          size={size * 0.45}
          color={colors.secondary}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
