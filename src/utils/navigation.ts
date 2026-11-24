import { router, type Href } from 'expo-router';

/** Volta para a tela anterior ou, se não houver (ex.: link direto), vai para `fallback`. */
export function goBack(fallback: Href) {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
}
