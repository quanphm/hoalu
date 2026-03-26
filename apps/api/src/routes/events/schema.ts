import { monetary } from "@hoalu/common/monetary";
import { CurrencySchema, IsoDateSchema } from "@hoalu/common/schema";
import * as z from "zod";

export const InsertEventSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().optional(),
    startDate: z.string().optional(), // "yyyy-MM-dd"
    endDate: z.string().optional(),   // "yyyy-MM-dd"
    budget: z.coerce.number().optional(),
    budgetCurrency: CurrencySchema.optional(),
    workspaceId: z.uuidv7(),
  })
  .refine(
    (val) => {
      if (val.startDate && val.endDate) {
        return val.endDate >= val.startDate;
      }
      return true;
    },
    { message: "end_date must be >= start_date", path: ["endDate"] },
  );

// Note: Do NOT use InsertEventSchema.omit() — InsertEventSchema has .refine() which returns
// a ZodPipe in Zod v4 and does not support .omit(). Define UpdateEventSchema independently.
export const UpdateEventSchema = z
  .object({
    title: z.string().min(1),
    description: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    budget: z.coerce.number().nullable(),
    budgetCurrency: CurrencySchema,
    status: z.enum(["open", "closed"]),
  })
  .partial()
  .refine(
    (val) => {
      if (val.startDate && val.endDate) {
        return val.endDate >= val.startDate;
      }
      return true;
    },
    { message: "end_date must be >= start_date", path: ["endDate"] },
  );

export const EventSchema = z
  .object({
    id: z.uuidv7(),
    title: z.string(),
    description: z.string().nullable(),
    startDate: z.string().nullable(),
    endDate: z.string().nullable(),
    budget: z.coerce.number().nullable(),
    budgetCurrency: CurrencySchema,
    status: z.enum(["open", "closed"]),
    workspaceId: z.uuidv7(),
    creatorId: z.uuidv7().nullable(),
    createdAt: IsoDateSchema,
    updatedAt: IsoDateSchema,
  })
  .transform((val) => ({
    ...val,
    realBudget: val.budget != null ? monetary.fromRealAmount(val.budget, val.budgetCurrency) : null,
  }));

export const EventsSchema = z.array(EventSchema);

export const DeleteEventSchema = z.object({
  id: z.uuidv7(),
});
