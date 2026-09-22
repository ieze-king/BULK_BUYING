/**
 * The festive-season bulk basket.
 *
 * Kept curated on purpose. A catalogue that grows without naming discipline
 * splits one commodity across several entries ("Rice", "Foreign Parboiled
 * Rice", "Mama Gold 50kg") and makes demand impossible to sum, which is the one
 * thing this pilot has to do. Add breadth through `aliases` before adding rows.
 *
 * Prices are indicative market prices in naira. They are never shown while
 * browsing — only on the submit screen, labelled, to anchor the commitment
 * question. Review them before each campaign.
 */
export type SeedProduct = {
  slug: string;
  name: string;
  category: string;
  unitLabel: string;
  indicativePriceNgn: number | null;
  /** Extra search terms, comma-separated. What people type, not what we call it. */
  aliases: string;
};

export const CATALOG: SeedProduct[] = [
  // Grains & staples
  { slug: "rice-50kg", name: "Rice (50kg)", category: "Grains & Staples", unitLabel: "bag", indicativePriceNgn: 78000, aliases: "parboiled, foreign rice, local rice, ofada, long grain" },
  { slug: "beans-50kg", name: "Beans (50kg)", category: "Grains & Staples", unitLabel: "bag", indicativePriceNgn: 95000, aliases: "ewa, oloyin, honey beans, drum" },
  { slug: "garri-50kg", name: "Garri (50kg)", category: "Grains & Staples", unitLabel: "bag", indicativePriceNgn: 42000, aliases: "gari, ijebu, yellow garri, white garri, cassava" },
  { slug: "semovita", name: "Semovita / Semolina", category: "Grains & Staples", unitLabel: "carton", indicativePriceNgn: 28000, aliases: "semo, semolina, swallow" },
  { slug: "flour-50kg", name: "Flour (50kg)", category: "Grains & Staples", unitLabel: "bag", indicativePriceNgn: 55000, aliases: "baking flour, wheat" },
  { slug: "spaghetti", name: "Spaghetti", category: "Grains & Staples", unitLabel: "carton", indicativePriceNgn: 15500, aliases: "pasta, macaroni" },
  { slug: "noodles", name: "Noodles", category: "Grains & Staples", unitLabel: "carton", indicativePriceNgn: 14000, aliases: "indomie, instant noodles, chicken noodles" },

  // Cooking essentials
  { slug: "cooking-oil-25l", name: "Cooking Oil (25L)", category: "Cooking Essentials", unitLabel: "keg", indicativePriceNgn: 58000, aliases: "vegetable oil, groundnut oil, frying oil" },
  { slug: "palm-oil-25l", name: "Palm Oil (25L)", category: "Cooking Essentials", unitLabel: "keg", indicativePriceNgn: 48000, aliases: "red oil, epo pupa" },
  { slug: "tomato-paste", name: "Tomato Paste", category: "Cooking Essentials", unitLabel: "carton", indicativePriceNgn: 22000, aliases: "tin tomato, sachet tomato, puree" },
  { slug: "sugar-50kg", name: "Sugar (50kg)", category: "Cooking Essentials", unitLabel: "bag", indicativePriceNgn: 62000, aliases: "granulated sugar, cube sugar" },
  { slug: "salt", name: "Salt", category: "Cooking Essentials", unitLabel: "bag", indicativePriceNgn: 9000, aliases: "table salt, iodised salt" },
  { slug: "seasoning", name: "Seasoning Cubes", category: "Cooking Essentials", unitLabel: "carton", indicativePriceNgn: 18000, aliases: "maggi, knorr, royco, stock cubes, spices" },

  // Protein
  { slug: "frozen-chicken", name: "Frozen Chicken", category: "Protein", unitLabel: "carton", indicativePriceNgn: 52000, aliases: "chicken, poultry, broiler, frozen food" },
  { slug: "turkey", name: "Turkey", category: "Protein", unitLabel: "carton", indicativePriceNgn: 68000, aliases: "frozen turkey, christmas turkey" },
  { slug: "titus-fish", name: "Titus Fish", category: "Protein", unitLabel: "carton", indicativePriceNgn: 45000, aliases: "fish, mackerel, frozen fish, kote" },

  // Drinks
  { slug: "minerals", name: "Minerals / Soft Drinks", category: "Drinks", unitLabel: "crate", indicativePriceNgn: 6500, aliases: "coke, fanta, sprite, pepsi, soda, drinks" },
  { slug: "bottled-water", name: "Bottled Water", category: "Drinks", unitLabel: "pack", indicativePriceNgn: 2200, aliases: "water, pure water, table water, sachet water" },
  { slug: "malt", name: "Malt Drinks", category: "Drinks", unitLabel: "crate", indicativePriceNgn: 9500, aliases: "malta, amstel, maltina, non alcoholic" },

  // Household
  { slug: "detergent", name: "Detergent", category: "Household", unitLabel: "carton", indicativePriceNgn: 24000, aliases: "omo, ariel, soap, washing powder, klin" },
  { slug: "cooking-gas", name: "Cooking Gas (12.5kg)", category: "Household", unitLabel: "cylinder", indicativePriceNgn: 16500, aliases: "gas, lpg, refill, cylinder" },
  { slug: "toilet-roll", name: "Toilet Roll", category: "Household", unitLabel: "carton", indicativePriceNgn: 13000, aliases: "tissue, tissue paper, rolls" },

  // Personal care
  { slug: "bath-soap", name: "Bath Soap", category: "Personal Care", unitLabel: "carton", indicativePriceNgn: 19000, aliases: "soap, lux, premier, bathing soap" },
  { slug: "toothpaste", name: "Toothpaste", category: "Personal Care", unitLabel: "carton", indicativePriceNgn: 21000, aliases: "close up, oral b, macleans, paste" },
  { slug: "sanitary-pads", name: "Sanitary Pads", category: "Personal Care", unitLabel: "carton", indicativePriceNgn: 26000, aliases: "always, pads, sanitary towel" },
  { slug: "diapers", name: "Diapers", category: "Personal Care", unitLabel: "carton", indicativePriceNgn: 34000, aliases: "pampers, huggies, baby diapers" },
  { slug: "body-lotion", name: "Body Lotion", category: "Personal Care", unitLabel: "carton", indicativePriceNgn: 23000, aliases: "cream, moisturiser, lotion" },

  // Building materials
  { slug: "cement", name: "Cement (50kg)", category: "Building Materials", unitLabel: "bag", indicativePriceNgn: 9500, aliases: "dangote, bua, lafarge, concrete" },
  { slug: "iron-rods", name: "Iron Rods (12mm)", category: "Building Materials", unitLabel: "length", indicativePriceNgn: 11500, aliases: "reinforcement, steel, rebar, rod" },
  { slug: "roofing-sheets", name: "Roofing Sheets", category: "Building Materials", unitLabel: "bundle", indicativePriceNgn: 87000, aliases: "aluminium, zinc, steptile, roof" },
  { slug: "paint", name: "Emulsion Paint (20L)", category: "Building Materials", unitLabel: "bucket", indicativePriceNgn: 32000, aliases: "paint, emulsion, satin, wall paint" },
  { slug: "plywood", name: "Plywood", category: "Building Materials", unitLabel: "sheet", indicativePriceNgn: 14000, aliases: "board, marine board, timber" },
];

export const CATEGORY_ORDER = [
  "Grains & Staples",
  "Cooking Essentials",
  "Protein",
  "Drinks",
  "Household",
  "Personal Care",
  "Building Materials",
];
