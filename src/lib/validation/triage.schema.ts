import { z } from "zod";

const vitalsSchema = z.object({
  systolicBp: z.number().int().min(50).max(300).optional(),
  diastolicBp: z.number().int().min(20).max(200).optional(),
  heartRate: z.number().int().min(20).max(300).optional(),
  temperature: z.number().min(30).max(45).optional(),
  spo2: z.number().int().min(50).max(100).optional(),
  respiratoryRate: z.number().int().min(4).max(60).optional(),
});

export const triageInputSchema = z.object({
  visitId: z.string().cuid(),
  symptoms: z.array(z.string().min(1).max(100)).min(1).max(20),
  painScale: z.number().int().min(0).max(10),
  symptomOnset: z.enum(["sudden", "gradual", "worsening", "intermittent"]),
  symptomDuration: z.string().min(1).max(100),
  vitals: vitalsSchema.optional(),
  // Enrichment fields sent from client session
  age: z.number().int().min(0).max(130).default(30),
  sex: z.string().max(20).default("unknown"),
  chiefComplaint: z.string().max(500).default(""),
});

export type TriageInputRaw = z.infer<typeof triageInputSchema>;
