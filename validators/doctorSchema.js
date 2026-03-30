import { z } from "zod";

export const doctorSignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  specialization: z.string().min(2, "Specialization is required").max(100),
  registrationNumber: z
    .string()
    .min(3, "Registration number is required")
    .max(50)
    .regex(
      /^PMDC-\d{4}-\d{3,}$/,
      "Registration number must follow the format: PMDC-YYYY-NNN",
    ),
});

export const doctorLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const doctorIdSchema = z.object({
  id: z.string().uuid("Invalid doctor ID format"),
});
