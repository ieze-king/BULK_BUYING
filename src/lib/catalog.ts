/**
 * The festive-season bulk basket.
 *
 * Kept curated on purpose. A catalogue that grows without naming discipline
 * splits one commodity across several entries ("Rice", "Foreign Parboiled
 * Rice", "Mama Gold 50kg") and makes demand impossible to sum, which is the one
 * thing this pilot has to do. Add breadth through `aliases` before adding rows.
 *
 * No prices. We do not have real supplier quotes, and a made-up figure shown to
 * a user is worse than no figure: they read it as our offer and it biases the
 * demand we are trying to measure. The `indicative_price_ngn` column is left in
 * place, empty, for when actual quotes exist.
 */
export type SeedProduct = {
  slug: string;
  name: string;
  category: string;
  unitLabel: string;
  /** Extra search terms, comma-separated. What people type, not what we call it. */
  aliases: string;
};

export const CATALOG: SeedProduct[] = [
  // Grains & staples
  { slug: "rice-50kg", name: "Rice (50kg)", category: "Grains & Staples", unitLabel: "bag", aliases: "parboiled, foreign rice, local rice, ofada, long grain" },
  { slug: "beans-50kg", name: "Beans (50kg)", category: "Grains & Staples", unitLabel: "bag", aliases: "ewa, oloyin, honey beans, drum" },
  { slug: "garri-50kg", name: "Garri (50kg)", category: "Grains & Staples", unitLabel: "bag", aliases: "gari, ijebu, yellow garri, white garri, cassava" },
  { slug: "semovita", name: "Semovita / Semolina", category: "Grains & Staples", unitLabel: "carton", aliases: "semo, semolina, swallow" },
  { slug: "flour-50kg", name: "Flour (50kg)", category: "Grains & Staples", unitLabel: "bag", aliases: "baking flour, wheat" },
  { slug: "spaghetti", name: "Spaghetti", category: "Grains & Staples", unitLabel: "carton", aliases: "pasta, macaroni" },
  { slug: "noodles", name: "Noodles", category: "Grains & Staples", unitLabel: "carton", aliases: "indomie, instant noodles, chicken noodles" },

  // Cooking essentials
  { slug: "cooking-oil-25l", name: "Cooking Oil (25L)", category: "Cooking Essentials", unitLabel: "keg", aliases: "vegetable oil, groundnut oil, frying oil" },
  { slug: "palm-oil-25l", name: "Palm Oil (25L)", category: "Cooking Essentials", unitLabel: "keg", aliases: "red oil, epo pupa" },
  { slug: "tomato-paste", name: "Tomato Paste", category: "Cooking Essentials", unitLabel: "carton", aliases: "tin tomato, sachet tomato, puree" },
  { slug: "sugar-50kg", name: "Sugar (50kg)", category: "Cooking Essentials", unitLabel: "bag", aliases: "granulated sugar, cube sugar" },
  { slug: "salt", name: "Salt", category: "Cooking Essentials", unitLabel: "bag", aliases: "table salt, iodised salt" },
  { slug: "seasoning", name: "Seasoning Cubes", category: "Cooking Essentials", unitLabel: "carton", aliases: "maggi, knorr, royco, stock cubes, spices" },

  // Protein
  { slug: "frozen-chicken", name: "Frozen Chicken", category: "Protein", unitLabel: "carton", aliases: "chicken, poultry, broiler, frozen food" },
  { slug: "turkey", name: "Turkey", category: "Protein", unitLabel: "carton", aliases: "frozen turkey, christmas turkey" },
  { slug: "titus-fish", name: "Titus Fish", category: "Protein", unitLabel: "carton", aliases: "fish, mackerel, frozen fish, kote" },

  // Drinks
  { slug: "minerals", name: "Minerals / Soft Drinks", category: "Drinks", unitLabel: "crate", aliases: "coke, fanta, sprite, pepsi, soda, drinks" },
  { slug: "bottled-water", name: "Bottled Water", category: "Drinks", unitLabel: "pack", aliases: "water, pure water, table water, sachet water" },
  { slug: "malt", name: "Malt Drinks", category: "Drinks", unitLabel: "crate", aliases: "malta, amstel, maltina, non alcoholic" },

  // Household
  { slug: "detergent", name: "Detergent", category: "Household", unitLabel: "carton", aliases: "omo, ariel, soap, washing powder, klin" },
  { slug: "cooking-gas", name: "Cooking Gas (12.5kg)", category: "Household", unitLabel: "cylinder", aliases: "gas, lpg, refill, cylinder" },
  { slug: "toilet-roll", name: "Toilet Roll", category: "Household", unitLabel: "carton", aliases: "tissue, tissue paper, rolls" },

  // Personal care
  { slug: "bath-soap", name: "Bath Soap", category: "Personal Care", unitLabel: "carton", aliases: "soap, lux, premier, bathing soap" },
  { slug: "toothpaste", name: "Toothpaste", category: "Personal Care", unitLabel: "carton", aliases: "close up, oral b, macleans, paste" },
  { slug: "sanitary-pads", name: "Sanitary Pads", category: "Personal Care", unitLabel: "carton", aliases: "always, pads, sanitary towel" },
  { slug: "diapers", name: "Diapers", category: "Personal Care", unitLabel: "carton", aliases: "pampers, huggies, baby diapers" },
  { slug: "body-lotion", name: "Body Lotion", category: "Personal Care", unitLabel: "carton", aliases: "cream, moisturiser, lotion" },

  // Building materials
  { slug: "cement", name: "Cement (50kg)", category: "Building Materials", unitLabel: "bag", aliases: "dangote, bua, lafarge, concrete" },
  { slug: "iron-rods", name: "Iron Rods (12mm)", category: "Building Materials", unitLabel: "length", aliases: "reinforcement, steel, rebar, rod" },
  { slug: "roofing-sheets", name: "Roofing Sheets", category: "Building Materials", unitLabel: "bundle", aliases: "aluminium, zinc, steptile, roof" },
  { slug: "paint", name: "Emulsion Paint (20L)", category: "Building Materials", unitLabel: "bucket", aliases: "paint, emulsion, satin, wall paint" },
  { slug: "plywood", name: "Plywood", category: "Building Materials", unitLabel: "sheet", aliases: "board, marine board, timber" },
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
