import { z } from "zod";
import { normalizeNgPhone } from "./phone";

/** Sanity caps: a household ordering 10,000 bags of rice is a typo or a joke. */
export const MAX_QUANTITY = 500;
export const MAX_ITEMS = 25;

export const quantitySchema = z.coerce.number().int().min(0).max(MAX_QUANTITY);

export const participantTypeSchema = z.enum([
  "individual",
  "business",
  "retailer",
  "distributor",
]);

/** Browsers submit present-but-empty fields as ""; treat that as absent. */
const emptyToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((v) => (v === "" || v === null ? undefined : v), schema.optional());

export const submitSchema = z.object({
  contactName: z.string().trim().min(2, "Please enter your name").max(80),
  phone: z
    .string()
    .trim()
    .transform((v, ctx) => {
      const normalized = normalizeNgPhone(v);
      if (!normalized) {
        ctx.addIssue({
          code: "custom",
          message: "Enter a valid Nigerian mobile number, e.g. 0803 123 4567",
        });
        return z.NEVER;
      }
      return normalized;
    }),
  participantType: participantTypeSchema,
  stateCode: z.string().trim().min(2, "Please choose your state"),
  lgaId: emptyToUndefined(z.coerce.number().int().positive()),
  area: emptyToUndefined(z.string().trim().max(120)),
  wouldBuyAtPrice: z.enum(["yes", "no"], { message: "Please answer the last question" }),
  consent: z.literal("on", { message: "Please accept so we can contact you" }),
  productRequest: emptyToUndefined(z.string().trim().max(300)),
  // The honeypot field is checked in the action, before validation runs.
});

export type SubmitInput = z.infer<typeof submitSchema>;
