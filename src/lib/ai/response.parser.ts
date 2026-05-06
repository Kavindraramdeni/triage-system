import { z } from "zod";

const differentialSchema = z.object({
  condition: z.string(),
  probability: z.enum(["high", "moderate", "low"]),
  reasoning: z.string(),
});

const recommendationSchema = z.object({
  action: z.string(),
  priority: z.enum(["immediate", "urgent", "routine"]),
});

export const aiResponseSchema = z.object({
  esiLevel: z.enum(["ESI_1", "ESI_2", "ESI_3", "ESI_4", "ESI_5"]),
  urgencyScore: z.number().min(0).max(1),
  urgencyFlags: z.array(
    z.enum([
      "CHEST_PAIN",
      "DIFFICULTY_BREATHING",
      "ALTERED_CONSCIOUSNESS",
      "SEVERE_BLEEDING",
      "STROKE_SYMPTOMS",
      "ANAPHYLAXIS",
      "PEDIATRIC_FEVER",
      "NONE",
    ])
  ),
  clinicalSummary: z.string().min(20).max(600),
  differentials: z.array(differentialSchema).min(1).max(5),
  recommendations: z.array(recommendationSchema).min(1).max(6),
  redFlags: z.array(z.string()),
});

export type AiTriageResponse = z.infer<typeof aiResponseSchema>;

export function parseAiResponse(raw: string): AiTriageResponse {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`AI returned non-JSON response: ${raw.slice(0, 200)}`);
  }

  const result = aiResponseSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(
      `AI response failed schema validation: ${JSON.stringify(result.error.flatten())}`
    );
  }

  return result.data;
}
