import { z } from "zod";

export const doctorLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const doctorIdSchema = z.object({
  id: z.string().uuid("Invalid doctor ID format"),
});
