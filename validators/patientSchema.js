import { z } from "zod";

export const registerPatientSchema = z.object({
  name: z.string().min(2, "Name is required"),
  age: z
    .number()
    .min(0, "Age must be a positive number")
    .max(120, "Age must be less than or equal to 120"),
  complaint: z
    .string()
    .min(5, "Complaint must be at least 5 characters long")
    .max(500, "Complaint must be less than or equal to 500 characters long"),
  severity: z
    .number()
    .int()
    .min(1, "Severity must be at least 1")
    .max(5, "Severity must be at most 5"),
});

export const patientIdSchema = z.object({
  id: z.string().uuid("Invalid patient ID format"),
});
