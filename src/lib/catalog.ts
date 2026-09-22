/**
 * The bulk basket.
 *
 * Commodity-level, one row per thing people buy, deliberately not an imported
 * product feed. A catalogue that grows without naming discipline splits one
 * commodity across several entries ("Rice", "Mama Gold 50kg", "foreign
 * parboiled") and makes demand impossible to sum, which is the one thing this
 * pilot has to do.
 *
 * Two rules when adding:
 *   1. Add breadth through `aliases`, not through near-duplicate rows. Aliases
 *      are the words people type; the name is what we aggregate on.
 *   2. Let `product_requests` drive additions. Real people telling us what is
 *      missing beats guessing, and the admin dashboard ranks them.
 *
 * No prices. We have no supplier quotes, and an invented figure shown to a user
 * reads as our offer and biases the demand we are measuring. The
 * `indicative_price_ngn` column is left empty for when real quotes exist.
 */
export type SeedProduct = {
  slug: string;
  name: string;
  category: string;
  /** The unit people buy in. This vocabulary is what makes quantities addable. */
  unitLabel: string;
  /** Extra search terms, comma-separated. What people type, not what we call it. */
  aliases: string;
};

export const CATALOG: SeedProduct[] = [
  // ── Grains & Staples ────────────────────────────────────────────────
  { slug: "beans-50kg", name: "Beans (50kg)", category: "Grains & Staples", unitLabel: "bag", aliases: "ewa, oloyin, honey beans, drum, brown beans, white beans" },
  { slug: "corn-50kg", name: "Corn / Maize (50kg)", category: "Grains & Staples", unitLabel: "bag", aliases: "maize, agbado, yellow corn, white corn, ogi" },
  { slug: "flour-50kg", name: "Flour (50kg)", category: "Grains & Staples", unitLabel: "bag", aliases: "baking flour, wheat flour, golden penny" },
  { slug: "garri-50kg", name: "Garri (50kg)", category: "Grains & Staples", unitLabel: "bag", aliases: "gari, ijebu, yellow garri, white garri, cassava" },
  { slug: "guinea-corn-50kg", name: "Guinea Corn (50kg)", category: "Grains & Staples", unitLabel: "bag", aliases: "sorghum, dawa, okababa" },
  { slug: "millet-50kg", name: "Millet (50kg)", category: "Grains & Staples", unitLabel: "bag", aliases: "gero, maiwa, hungry rice, acha" },
  { slug: "noodles", name: "Noodles", category: "Grains & Staples", unitLabel: "carton", aliases: "indomie, instant noodles, chicken noodles, golden penny noodles" },
  { slug: "plantain-flour", name: "Plantain Flour", category: "Grains & Staples", unitLabel: "bag", aliases: "amala, elubo ogede, unripe plantain flour" },
  { slug: "poundo-yam", name: "Poundo Yam", category: "Grains & Staples", unitLabel: "carton", aliases: "pounded yam, poundo, instant pounded yam, swallow" },
  { slug: "rice-50kg", name: "Rice (50kg)", category: "Grains & Staples", unitLabel: "bag", aliases: "parboiled, foreign rice, local rice, ofada, long grain, basmati" },
  { slug: "semovita", name: "Semovita / Semolina", category: "Grains & Staples", unitLabel: "carton", aliases: "semo, semolina, swallow" },
  { slug: "soya-beans-50kg", name: "Soya Beans (50kg)", category: "Grains & Staples", unitLabel: "bag", aliases: "soybeans, soya, waken suya" },
  { slug: "spaghetti", name: "Spaghetti", category: "Grains & Staples", unitLabel: "carton", aliases: "pasta, macaroni, dangote spaghetti" },
  { slug: "wheat-meal", name: "Wheat Meal", category: "Grains & Staples", unitLabel: "carton", aliases: "wheat, swallow, diabetic swallow" },
  { slug: "yam-tubers", name: "Yam (tubers)", category: "Grains & Staples", unitLabel: "tuber", aliases: "isu, puna yam, water yam, new yam" },
  { slug: "yam-flour", name: "Yam Flour (Elubo)", category: "Grains & Staples", unitLabel: "bag", aliases: "elubo, amala isu, dried yam flour" },

  // ── Cooking Essentials ──────────────────────────────────────────────
  { slug: "chocolate-drink", name: "Chocolate Drink", category: "Cooking Essentials", unitLabel: "carton", aliases: "milo, bournvita, ovaltine, cocoa drink" },
  { slug: "cooking-oil-25l", name: "Cooking Oil (25L)", category: "Cooking Essentials", unitLabel: "keg", aliases: "vegetable oil, frying oil, kings oil, power oil" },
  { slug: "crayfish", name: "Crayfish", category: "Cooking Essentials", unitLabel: "bag", aliases: "dried crayfish, ede, prawn" },
  { slug: "curry-thyme", name: "Curry & Thyme", category: "Cooking Essentials", unitLabel: "carton", aliases: "spices, curry powder, thyme, bay leaf, seasoning" },
  { slug: "custard", name: "Custard", category: "Cooking Essentials", unitLabel: "carton", aliases: "checkers custard, pap, breakfast" },
  { slug: "dried-pepper", name: "Dried Pepper", category: "Cooking Essentials", unitLabel: "bag", aliases: "ground pepper, ata gigun, chilli, shombo, dry pepper" },
  { slug: "fresh-pepper", name: "Fresh Pepper", category: "Cooking Essentials", unitLabel: "basket", aliases: "rodo, tatashe, ata rodo, scotch bonnet, bell pepper" },
  { slug: "fresh-tomatoes", name: "Fresh Tomatoes", category: "Cooking Essentials", unitLabel: "basket", aliases: "tomato, tomatoes, jos tomatoes" },
  { slug: "garlic-ginger", name: "Garlic & Ginger", category: "Cooking Essentials", unitLabel: "bag", aliases: "ata ile, garlic, ginger, spices" },
  { slug: "groundnut-oil-25l", name: "Groundnut Oil (25L)", category: "Cooking Essentials", unitLabel: "keg", aliases: "peanut oil, epo epa, cooking oil" },
  { slug: "locust-beans", name: "Locust Beans (Iru)", category: "Cooking Essentials", unitLabel: "bag", aliases: "iru, ogiri, dawadawa, fermented locust beans" },
  { slug: "onions", name: "Onions", category: "Cooking Essentials", unitLabel: "bag", aliases: "alubosa, red onions, white onions" },
  { slug: "palm-oil-25l", name: "Palm Oil (25L)", category: "Cooking Essentials", unitLabel: "keg", aliases: "red oil, epo pupa, banga oil" },
  { slug: "powdered-milk", name: "Powdered Milk", category: "Cooking Essentials", unitLabel: "carton", aliases: "peak milk, dano, three crowns, milk, cowbell" },
  { slug: "salt", name: "Salt", category: "Cooking Essentials", unitLabel: "bag", aliases: "table salt, iodised salt, dangote salt" },
  { slug: "seasoning", name: "Seasoning Cubes", category: "Cooking Essentials", unitLabel: "carton", aliases: "maggi, knorr, royco, stock cubes, onga" },
  { slug: "sugar-50kg", name: "Sugar (50kg)", category: "Cooking Essentials", unitLabel: "bag", aliases: "granulated sugar, cube sugar, dangote sugar, st louis" },
  { slug: "tea", name: "Tea", category: "Cooking Essentials", unitLabel: "carton", aliases: "lipton, top tea, green tea, tea bags" },
  { slug: "tomato-paste", name: "Tomato Paste", category: "Cooking Essentials", unitLabel: "carton", aliases: "tin tomato, sachet tomato, puree, gino, derica" },
  { slug: "yeast-baking-powder", name: "Yeast & Baking Powder", category: "Cooking Essentials", unitLabel: "carton", aliases: "yeast, baking powder, baking soda, bakers" },

  // ── Protein ─────────────────────────────────────────────────────────
  { slug: "beef", name: "Beef", category: "Protein", unitLabel: "carton", aliases: "cow meat, eran malu, red meat, fresh beef" },
  { slug: "catfish", name: "Catfish", category: "Protein", unitLabel: "carton", aliases: "point and kill, fresh fish, eja, smoked catfish" },
  { slug: "corned-beef", name: "Corned Beef", category: "Protein", unitLabel: "carton", aliases: "exeter, tin beef, luncheon meat" },
  { slug: "dried-fish", name: "Dried Fish", category: "Protein", unitLabel: "bag", aliases: "smoked fish, panla, eja gbigbe, dry fish" },
  { slug: "eggs", name: "Eggs", category: "Protein", unitLabel: "crate", aliases: "egg, crate of eggs, poultry eggs" },
  { slug: "frozen-chicken", name: "Frozen Chicken", category: "Protein", unitLabel: "carton", aliases: "chicken, poultry, broiler, frozen food, chicken lap" },
  { slug: "goat-meat", name: "Goat Meat", category: "Protein", unitLabel: "carton", aliases: "eran ewure, chevon, goat" },
  { slug: "live-chickens", name: "Live Chickens", category: "Protein", unitLabel: "bird", aliases: "broiler, layer, cockerel, live birds, poultry" },
  { slug: "sardines", name: "Sardines", category: "Protein", unitLabel: "carton", aliases: "tin fish, titus sardine, queen of the coast" },
  { slug: "stockfish", name: "Stockfish", category: "Protein", unitLabel: "bag", aliases: "okporoko, panla, dried cod" },
  { slug: "titus-fish", name: "Titus Fish", category: "Protein", unitLabel: "carton", aliases: "fish, mackerel, frozen fish, kote" },
  { slug: "turkey", name: "Turkey", category: "Protein", unitLabel: "carton", aliases: "frozen turkey, christmas turkey, turkey wings" },

  // ── Drinks ──────────────────────────────────────────────────────────
  { slug: "beer", name: "Beer", category: "Drinks", unitLabel: "crate", aliases: "star, gulder, trophy, heineken, stout, alcohol" },
  { slug: "bottled-water", name: "Bottled Water", category: "Drinks", unitLabel: "pack", aliases: "water, table water, eva, cway, bottle water" },
  { slug: "energy-drinks", name: "Energy Drinks", category: "Drinks", unitLabel: "carton", aliases: "power horse, fearless, predator, red bull, bullet" },
  { slug: "fruit-juice", name: "Fruit Juice", category: "Drinks", unitLabel: "carton", aliases: "chivita, five alive, juice, hollandia, pulpy" },
  { slug: "malt", name: "Malt Drinks", category: "Drinks", unitLabel: "crate", aliases: "malta, amstel, maltina, non alcoholic, malt" },
  { slug: "minerals", name: "Minerals / Soft Drinks", category: "Drinks", unitLabel: "crate", aliases: "coke, fanta, sprite, pepsi, soda, drinks, bigi" },
  { slug: "sachet-water", name: "Sachet Water", category: "Drinks", unitLabel: "bag", aliases: "pure water, sachet, pure water bag" },
  { slug: "yoghurt", name: "Yoghurt", category: "Drinks", unitLabel: "carton", aliases: "hollandia yoghurt, fearless, dairy, yogurt" },

  // ── Household ───────────────────────────────────────────────────────
  { slug: "bleach", name: "Bleach", category: "Household", unitLabel: "carton", aliases: "hypo, jik, disinfectant, chlorine" },
  { slug: "brooms-mops", name: "Brooms & Mops", category: "Household", unitLabel: "bundle", aliases: "broom, igbale, mop, cleaning" },
  { slug: "buckets-bowls", name: "Buckets & Bowls", category: "Household", unitLabel: "carton", aliases: "bucket, bowl, plastic, garage, basin" },
  { slug: "candles", name: "Candles", category: "Household", unitLabel: "carton", aliases: "candle, abela, light" },
  { slug: "charcoal", name: "Charcoal", category: "Household", unitLabel: "bag", aliases: "coal, firewood, eedu, grilling" },
  { slug: "cooking-gas", name: "Cooking Gas (12.5kg)", category: "Household", unitLabel: "cylinder", aliases: "gas, lpg, refill, cylinder" },
  { slug: "detergent", name: "Detergent", category: "Household", unitLabel: "carton", aliases: "omo, ariel, soap, washing powder, klin, sunlight" },
  { slug: "dishwashing-liquid", name: "Dishwashing Liquid", category: "Household", unitLabel: "carton", aliases: "morning fresh, dish soap, liquid soap" },
  { slug: "disposables", name: "Disposable Plates & Cups", category: "Household", unitLabel: "carton", aliases: "takeaway pack, disposable, paper plate, plastic cup, party pack" },
  { slug: "insecticide", name: "Insecticide", category: "Household", unitLabel: "carton", aliases: "raid, mortein, baygon, mosquito spray, otapiapia" },
  { slug: "kerosene", name: "Kerosene", category: "Household", unitLabel: "keg", aliases: "dpk, lantern fuel, stove fuel" },
  { slug: "matches-lighters", name: "Matches & Lighters", category: "Household", unitLabel: "carton", aliases: "matchbox, lighter, igniter" },
  { slug: "nylon-bags", name: "Nylon & Packaging Bags", category: "Household", unitLabel: "bag", aliases: "nylon, cellophane, carrier bag, polythene, packaging" },
  { slug: "toilet-roll", name: "Toilet Roll", category: "Household", unitLabel: "carton", aliases: "tissue, tissue paper, rolls, serviette" },

  // ── Personal Care ───────────────────────────────────────────────────
  { slug: "baby-wipes", name: "Baby Wipes", category: "Personal Care", unitLabel: "carton", aliases: "wipes, huggies wipes, baby care" },
  { slug: "bath-soap", name: "Bath Soap", category: "Personal Care", unitLabel: "carton", aliases: "soap, lux, premier, bathing soap, dettol, joy" },
  { slug: "body-lotion", name: "Body Lotion", category: "Personal Care", unitLabel: "carton", aliases: "cream, moisturiser, lotion, nivea" },
  { slug: "deodorant", name: "Deodorant", category: "Personal Care", unitLabel: "carton", aliases: "roll on, spray, body spray, antiperspirant" },
  { slug: "diapers", name: "Diapers", category: "Personal Care", unitLabel: "carton", aliases: "pampers, huggies, baby diapers, molfix" },
  { slug: "hair-cream", name: "Hair Cream & Relaxer", category: "Personal Care", unitLabel: "carton", aliases: "relaxer, hair food, pomade, texturiser" },
  { slug: "petroleum-jelly", name: "Petroleum Jelly", category: "Personal Care", unitLabel: "carton", aliases: "vaseline, jelly, ori" },
  { slug: "sanitary-pads", name: "Sanitary Pads", category: "Personal Care", unitLabel: "carton", aliases: "always, pads, sanitary towel, whisper" },
  { slug: "shampoo", name: "Shampoo", category: "Personal Care", unitLabel: "carton", aliases: "hair wash, conditioner, shampoo" },
  { slug: "shaving-razors", name: "Shaving Razors", category: "Personal Care", unitLabel: "carton", aliases: "razor, blade, shaving stick, gillette" },
  { slug: "toothbrush", name: "Toothbrush", category: "Personal Care", unitLabel: "carton", aliases: "brush, oral care, dental" },
  { slug: "toothpaste", name: "Toothpaste", category: "Personal Care", unitLabel: "carton", aliases: "close up, oral b, macleans, paste, dabur" },

  // ── Building Materials ──────────────────────────────────────────────
  { slug: "binding-wire", name: "Binding Wire", category: "Building Materials", unitLabel: "roll", aliases: "tie wire, reinforcement wire, wire" },
  { slug: "cement", name: "Cement (50kg)", category: "Building Materials", unitLabel: "bag", aliases: "dangote, bua, lafarge, elephant, concrete" },
  { slug: "electrical-cables", name: "Electrical Cables", category: "Building Materials", unitLabel: "roll", aliases: "wire, cable, armoured cable, wiring, nocaco" },
  { slug: "gloss-paint", name: "Gloss Paint (4L)", category: "Building Materials", unitLabel: "bucket", aliases: "oil paint, gloss, enamel, paint" },
  { slug: "granite", name: "Granite / Gravel", category: "Building Materials", unitLabel: "trip", aliases: "stone, chippings, gravel, aggregate" },
  { slug: "iron-rods", name: "Iron Rods (12mm)", category: "Building Materials", unitLabel: "length", aliases: "reinforcement, steel, rebar, rod, 16mm" },
  { slug: "nails", name: "Nails", category: "Building Materials", unitLabel: "bag", aliases: "nail, roofing nail, concrete nail" },
  { slug: "paint", name: "Emulsion Paint (20L)", category: "Building Materials", unitLabel: "bucket", aliases: "paint, emulsion, satin, wall paint, texcote" },
  { slug: "plywood", name: "Plywood", category: "Building Materials", unitLabel: "sheet", aliases: "board, marine board, timber, mdf" },
  { slug: "pvc-pipes", name: "PVC Pipes", category: "Building Materials", unitLabel: "length", aliases: "pipe, plumbing, conduit, drainage pipe" },
  { slug: "roofing-sheets", name: "Roofing Sheets", category: "Building Materials", unitLabel: "bundle", aliases: "aluminium, zinc, steptile, roof, long span" },
  { slug: "sandcrete-blocks", name: "Sandcrete Blocks", category: "Building Materials", unitLabel: "piece", aliases: "block, 9 inch, 6 inch, moulded block" },
  { slug: "sharp-sand", name: "Sharp Sand", category: "Building Materials", unitLabel: "trip", aliases: "sand, plastering sand, filling sand" },
  { slug: "tiles", name: "Tiles", category: "Building Materials", unitLabel: "carton", aliases: "floor tiles, wall tiles, ceramic, porcelain, goodwill" },
  { slug: "water-tank", name: "Water Tank", category: "Building Materials", unitLabel: "piece", aliases: "geepee, storage tank, overhead tank, reservoir" },
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
