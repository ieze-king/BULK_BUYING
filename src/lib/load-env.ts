import { config } from "dotenv";

/**
 * Next.js loads .env.local automatically; the Drizzle CLI and seed script run
 * outside Next and do not, so they import this first.
 */
config({ path: ".env.local" });
config({ path: ".env" });
