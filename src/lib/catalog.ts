/**
 * The festive-season bulk basket: ~20 items on one screen.
 *
 * Kept small on purpose. A long catalogue splits the same commodity across
 * several spellings ("Rice", "Mama Gold 50kg", "foreign parboiled") and makes
 * demand impossible to sum, which is the one thing this pilot must do.
 *
 * Prices are indicative bulk prices in naira and exist to make the commitment
 * question concrete. Review them before each campaign.
 */
export type SeedProduct = {
  slug: string;
  name: string;
  category: string;
  unitLabel: string;
  indicativePriceNgn: number | null;
};

export const CATALOG: SeedProduct[] = [
  // Grains & staples
  { slug: "rice-50kg", name: "Rice (50kg)", category: "Grains & Staples", unitLabel: "bag", indicativePriceNgn: 78000 },
  { slug: "beans-50kg", name: "Beans (50kg)", category: "Grains & Staples", unitLabel: "bag", indicativePriceNgn: 95000 },
  { slug: "garri-50kg", name: "Garri (50kg)", category: "Grains & Staples", unitLabel: "bag", indicativePriceNgn: 42000 },
  { slug: "semovita", name: "Semovita / Semolina", category: "Grains & Staples", unitLabel: "carton", indicativePriceNgn: 28000 },
  { slug: "flour-50kg", name: "Flour (50kg)", category: "Grains & Staples", unitLabel: "bag", indicativePriceNgn: 55000 },
  { slug: "spaghetti", name: "Spaghetti", category: "Grains & Staples", unitLabel: "carton", indicativePriceNgn: 15500 },
  { slug: "noodles", name: "Indomie / Noodles", category: "Grains & Staples", unitLabel: "carton", indicativePriceNgn: 14000 },

  // Cooking essentials
  { slug: "cooking-oil-25l", name: "Cooking Oil (25L)", category: "Cooking Essentials", unitLabel: "keg", indicativePriceNgn: 58000 },
  { slug: "palm-oil-25l", name: "Palm Oil (25L)", category: "Cooking Essentials", unitLabel: "keg", indicativePriceNgn: 48000 },
  { slug: "tomato-paste", name: "Tomato Paste", category: "Cooking Essentials", unitLabel: "carton", indicativePriceNgn: 22000 },
  { slug: "sugar-50kg", name: "Sugar (50kg)", category: "Cooking Essentials", unitLabel: "bag", indicativePriceNgn: 62000 },
  { slug: "salt", name: "Salt", category: "Cooking Essentials", unitLabel: "bag", indicativePriceNgn: 9000 },
  { slug: "seasoning", name: "Seasoning (Maggi / Knorr)", category: "Cooking Essentials", unitLabel: "carton", indicativePriceNgn: 18000 },

  // Protein
  { slug: "frozen-chicken", name: "Frozen Chicken", category: "Protein", unitLabel: "carton", indicativePriceNgn: 52000 },
  { slug: "turkey", name: "Turkey", category: "Protein", unitLabel: "carton", indicativePriceNgn: 68000 },
  { slug: "titus-fish", name: "Titus Fish", category: "Protein", unitLabel: "carton", indicativePriceNgn: 45000 },

  // Drinks
  { slug: "minerals", name: "Minerals / Soft Drinks", category: "Drinks", unitLabel: "crate", indicativePriceNgn: 6500 },
  { slug: "bottled-water", name: "Bottled Water", category: "Drinks", unitLabel: "pack", indicativePriceNgn: 2200 },
  { slug: "malt", name: "Malt Drinks", category: "Drinks", unitLabel: "crate", indicativePriceNgn: 9500 },

  // Household
  { slug: "detergent", name: "Detergent", category: "Household", unitLabel: "carton", indicativePriceNgn: 24000 },
  { slug: "cooking-gas", name: "Cooking Gas (12.5kg)", category: "Household", unitLabel: "cylinder", indicativePriceNgn: 16500 },
];

export const CATEGORY_ORDER = [
  "Grains & Staples",
  "Cooking Essentials",
  "Protein",
  "Drinks",
  "Household",
];
