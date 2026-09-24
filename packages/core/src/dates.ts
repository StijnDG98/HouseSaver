/** ISO date string, YYYY-MM-DD. */
export type IsoDate = string;

/** "14-08-2026" (Belfius statement) or "14/08/2026" (receipt, card statement) → "2026-08-14". */
export function parseBelgianDate(text: string): IsoDate {
  const m = /^(\d{2})[-/](\d{2})[-/](\d{4})$/.exec(text.trim());
  if (!m) throw new Error(`Not a dd-mm-yyyy date: "${text}"`);
  return `${m[3]}-${m[2]}-${m[1]}`;
}

/** "18/07/26" (inside a card description) → "2026-07-18". Two-digit years are 20xx. */
export function parseShortBelgianDate(text: string): IsoDate {
  const m = /^(\d{2})\/(\d{2})\/(\d{2})$/.exec(text.trim());
  if (!m) throw new Error(`Not a dd/mm/yy date: "${text}"`);
  return `20${m[3]}-${m[2]}-${m[1]}`;
}

/** Calendar days between two ISO dates (b − a). */
export function daysBetween(a: IsoDate, b: IsoDate): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
}
