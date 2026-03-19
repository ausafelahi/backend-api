import { z } from "zod";

export const auditQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 100))
    .pipe(
      z
        .number()
        .int()
        .min(1, "Limit must be at least 1")
        .max(500, "Limit must be at most 500"),
    ),
  offset: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 0))
    .pipe(z.number().int().min(0, "Offset must be a non-negative integer")),
});
