/**
 * Every category owns a hue, and that hue follows it everywhere: the pill, the
 * section heading, the tint on each product card. Colour is doing navigational
 * work here, so it stays consistent rather than decorative.
 */
const HUES: Record<string, string> = {
  "Grains & Staples": "var(--marigold)",
  "Cooking Essentials": "var(--coral)",
  Protein: "var(--plum)",
  Drinks: "var(--sky)",
  Household: "var(--accent)",
  "Personal Care": "var(--indigo)",
  "Building Materials": "var(--foreground)",
};

export function categoryHue(category: string) {
  return HUES[category] ?? "var(--accent)";
}

/** Colour alone never carries meaning; it always sits beside the label. */
export function categoryTint(category: string, pct = 14) {
  return `color-mix(in oklab, ${categoryHue(category)} ${pct}%, transparent)`;
}
