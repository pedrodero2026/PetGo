/** Formata valores em reais sem depender de Intl (nem todo motor JS do Android suporta). */
export function money(value: number): string {
  const [int, dec] = Math.abs(value).toFixed(2).split('.');
  const withDots = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${value < 0 ? '-' : ''}R$ ${withDots},${dec}`;
}

export function distanceLabel(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1).replace('.', ',')} km`;
}

export function dateTimeLabel(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} às ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function ratingLabel(rating: number): string {
  return rating.toFixed(1).replace('.', ',');
}

/** "dd/mm/aaaa" -> ISO, ou undefined se inválida. */
export function parseBrDate(text: string): string | undefined {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text.trim());
  if (!m) return undefined;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  if (isNaN(d.getTime()) || d > new Date()) return undefined;
  return d.toISOString();
}

export function toBrDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** Aplica a máscara dd/mm/aaaa enquanto digita. */
export function maskDate(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean).join('/');
}

export function maskZip(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

/** "agora", "há 5 min", "há 2 h", ou a data. */
export function timeAgo(iso: string): string {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `há ${min} min`;
  if (min < 24 * 60) return `há ${Math.floor(min / 60)} h`;
  return dateTimeLabel(iso);
}

/** Converte "12,50", "1.234,50" ou "12.5" em número (ou NaN). */
export function parseMoney(text: string): number {
  const t = text.trim();
  return Number(t.includes(',') ? t.replace(/\./g, '').replace(',', '.') : t);
}

/** 12.5 -> "12,50" para preencher campos. */
export function moneyInput(value?: number): string {
  return value === undefined ? '' : value.toFixed(2).replace('.', ',');
}
