/** All amounts in the app are integer euro cents. */
export type Cents = number;

const BELGIAN_AMOUNT = /^([+-])?\s*(\d{1,3}(?:\.\d{3})*|\d+),(\d{2})$/;

/**
 * Parse a Belgian-formatted amount as printed by Belfius: "1.234,56", "- 6,95", "+1.250,00".
 * Thousands separator is a dot, decimal separator a comma. Throws on anything else.
 */
export function parseBelgianAmount(text: string): Cents {
  const m = BELGIAN_AMOUNT.exec(text.trim().replace(/\s+/g, ''));
  if (!m) throw new Error(`Not a Belgian amount: "${text}"`);
  const sign = m[1] === '-' ? -1 : 1;
  const whole = Number(m[2]!.replace(/\./g, ''));
  const cents = Number(m[3]!);
  return sign * (whole * 100 + cents);
}

const RECEIPT_AMOUNT = /^(-)?(\d+)\.(\d{2})$/;

/** Parse a Colruyt receipt amount: decimal point, no thousands separator, e.g. "242.68", "-1.39". */
export function parseReceiptAmount(text: string): Cents {
  const m = RECEIPT_AMOUNT.exec(text.trim());
  if (!m) throw new Error(`Not a receipt amount: "${text}"`);
  const sign = m[1] ? -1 : 1;
  return sign * (Number(m[2]!) * 100 + Number(m[3]!));
}

/** Format cents the Belgian way for the UI: "€ 1.234,56", "− € 6,95". Uses a non-breaking space. */
export function formatEuro(cents: Cents): string {
  const abs = Math.abs(cents);
  const whole = Math.floor(abs / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const frac = (abs % 100).toString().padStart(2, '0');
  return `${cents < 0 ? '− ' : ''}€\u00a0${whole},${frac}`;
}
