export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function toDateInputValue(date: Date | string): string {
  const d = new Date(date);
  return d.toISOString().split("T")[0]; // "YYYY-MM-DD"
}

const UNICODE_FRACTIONS: Record<string, number> = {
  "¼": 0.25, "½": 0.5, "¾": 0.75,
  "⅓": 1 / 3, "⅔": 2 / 3,
  "⅛": 0.125, "⅜": 0.375, "⅝": 0.625, "⅞": 0.875,
};

const COMMON_FRACTIONS: [number, string][] = [
  [1 / 8, "1/8"], [1 / 4, "1/4"], [1 / 3, "1/3"], [3 / 8, "3/8"],
  [1 / 2, "1/2"], [5 / 8, "5/8"], [2 / 3, "2/3"], [3 / 4, "3/4"], [7 / 8, "7/8"],
];

// Matches the leading amount of an ingredient: mixed number, fraction,
// number+unicode fraction, standalone unicode fraction, or plain decimal/integer.
const LEADING_AMOUNT =
  /^(\d+\s+\d+\/\d+|\d+\/\d+|\d+\.?\d*\s*[¼½¾⅓⅔⅛⅜⅝⅞]|[¼½¾⅓⅔⅛⅜⅝⅞]|\d+\.?\d*)/;

function parseAmount(s: string): number {
  const t = s.trim();
  // Integer/decimal + unicode fraction suffix e.g. "1¼"
  const withUnicode = t.match(/^(\d+\.?\d*)\s*([¼½¾⅓⅔⅛⅜⅝⅞])$/);
  if (withUnicode) return parseFloat(withUnicode[1]) + UNICODE_FRACTIONS[withUnicode[2]];
  // Standalone unicode fraction
  if (UNICODE_FRACTIONS[t] !== undefined) return UNICODE_FRACTIONS[t];
  // Mixed number e.g. "1 1/2"
  const mixed = t.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) return parseInt(mixed[1]) + parseInt(mixed[2]) / parseInt(mixed[3]);
  // Fraction e.g. "1/2"
  const frac = t.match(/^(\d+)\/(\d+)$/);
  if (frac) return parseInt(frac[1]) / parseInt(frac[2]);
  return parseFloat(t);
}

function formatAmount(n: number): string {
  const whole = Math.floor(n);
  const frac = n - whole;
  if (frac < 0.01) return String(whole);
  for (const [val, str] of COMMON_FRACTIONS) {
    if (Math.abs(frac - val) < 0.03) return whole > 0 ? `${whole} ${str}` : str;
  }
  const rounded = Math.round(n * 100) / 100;
  return String(rounded);
}

export function scaleIngredient(ingredient: string, scale: number): string {
  if (scale === 1) return ingredient;
  const match = ingredient.match(LEADING_AMOUNT);
  if (!match) return ingredient;
  const value = parseAmount(match[1]);
  if (isNaN(value) || value === 0) return ingredient;
  return formatAmount(value * scale) + ingredient.slice(match[1].length);
}

// Matches the first gram quantity in an ingredient string, e.g. "500g", "375 grams", "10gr"
const GRAM_AMOUNT = /(\d+(?:\.\d+)?)\s*(?:grams?|gr?)\b/i;

export function parseGrams(ingredient: string): number | null {
  const match = ingredient.match(GRAM_AMOUNT);
  if (!match) return null;
  const n = parseFloat(match[1]);
  return isNaN(n) ? null : n;
}

// Returns baker's percentage for each ingredient relative to total flour weight.
// Ingredients without a parseable gram amount return null.
// Returns all-null if no flour ingredient is found or no flour has a gram amount.
export function calcBakersPercentages(ingredients: string[]): (number | null)[] {
  const grams = ingredients.map(parseGrams);
  const totalFlour = ingredients.reduce((sum, ing, i) => {
    if (/\bflour\b/i.test(ing) && grams[i] !== null) return sum + grams[i]!;
    return sum;
  }, 0);
  if (totalFlour === 0) return ingredients.map(() => null);
  return grams.map((g) =>
    g !== null ? Math.round((g / totalFlour) * 1000) / 10 : null
  );
}

export function formatTime(minutes: number): string {
  if (minutes <= 0) return "";
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hrs} hr`;
  return `${hrs} hr ${mins} min`;
}
