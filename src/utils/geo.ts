export interface LatLng {
  lat: number;
  lng: number;
}

/** Centro padrão (Av. Paulista, São Paulo), usado quando não há localização. */
export const DEFAULT_LOCATION: LatLng = { lat: -23.5614, lng: -46.6559 };

/** Distância em km entre dois pontos (fórmula de Haversine). */
export function distanceKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Geocodificação fictícia: gera uma coordenada estável (até ~3 km do centro)
 * a partir do CEP. Será substituída por um serviço real de geocodificação.
 */
export function fakeGeocode(zip: string): LatLng {
  let hash = 0;
  for (const ch of zip) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  const angle = ((hash >>> 0) % 360) * (Math.PI / 180);
  const dist = (((hash >>> 8) % 100) / 100) * 0.027; // ~3 km em graus
  return {
    lat: DEFAULT_LOCATION.lat + Math.sin(angle) * dist,
    lng: DEFAULT_LOCATION.lng + Math.cos(angle) * dist,
  };
}
