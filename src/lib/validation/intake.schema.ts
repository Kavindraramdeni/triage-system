import { z } from "zod";

export const intakeSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100).trim(),
  lastName: z.string().min(1, "Last name is required").max(100).trim(),
  dateOfBirth: z
    .string()
    .date("Enter a valid date")
    .refine(
      (d) => new Date(d) < new Date(),
      "Date of birth must be in the past"
    )
    .refine(
      (d) => new Date(d) > new Date("1900-01-01"),
      "Please enter a valid date of birth"
    ),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-()\u0900-\u097F]{7,15}$/, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  chiefComplaint: z
    .string()
    .min(5, "Please describe your main concern (at least 5 characters)")
    .max(500)
    .trim(),
});

export type IntakeInput = z.infer<typeof intakeSchema>;
