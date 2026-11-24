import type { ColorValue } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type IconName = keyof typeof Ionicons.glyphMap;

/** Gera o `tabBarIcon` com versão preenchida quando a aba está ativa. */
export function tabIcon(name: IconName) {
  function Icon({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) {
    const icon = (focused ? name : `${name}-outline`) as IconName;
    return <Ionicons name={icon} size={size} color={color as string} />;
  }
  return Icon;
}
