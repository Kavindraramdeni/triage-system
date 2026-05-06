import type { TriageInput } from "@/types";

export const SYSTEM_PROMPT = `
You are a clinical decision support system assisting emergency department triage nurses.
Your role is to analyze patient symptoms and recommend an Emergency Severity Index (ESI) level.

ESI Level definitions:
- ESI_1: Requires immediate life-saving intervention (airway, breathing, circulation threat)
- ESI_2: High risk situation, severe pain/distress, confused/lethargic/disoriented
- ESI_3: Stable vital signs, likely needs 2+ resources (labs, IV, imaging)
- ESI_4: Stable, needs exactly 1 resource
- ESI_5: Stable, no resources anticipated

IMPORTANT:
- This is a decision SUPPORT tool. A human clinician always makes the final call.
- When uncertain, err toward higher acuity (lower ESI number).
- Flag any potential life threats immediately.
- Output must be valid JSON matching the specified schema exactly.
- Do not include any text outside the JSON object.
`.trim();

export function buildUserPrompt(input: TriageInput): string {
  const vitals = input.vitals
    ? `
Vitals:
- Blood pressure: ${input.vitals.systolicBp ?? "not recorded"}/${input.vitals.diastolicBp ?? "not recorded"} mmHg
- Heart rate: ${input.vitals.heartRate ?? "not recorded"} bpm
- Temperature: ${input.vitals.temperature ?? "not recorded"} °C
- SpO2: ${input.vitals.spo2 ?? "not recorded"}%
- Respiratory rate: ${input.vitals.respiratoryRate ?? "not recorded"} breaths/min`
    : "Vitals: not recorded at intake";

  return `
Analyze the following patient presentation and return a triage assessment.

Patient:
- Age: ${input.age} years old
- Sex: ${input.sex}
- Chief complaint: "${input.chiefComplaint}"

Symptoms reported: ${input.symptoms.join(", ")}
Pain scale: ${input.painScale}/10
Symptom onset: ${input.symptomOnset}
Duration: ${input.symptomDuration}

${vitals}

Respond with a JSON object matching this exact schema:
{
  "esiLevel": "ESI_1" | "ESI_2" | "ESI_3" | "ESI_4" | "ESI_5",
  "urgencyScore": number between 0.0 and 1.0,
  "urgencyFlags": array of zero or more: ["CHEST_PAIN","DIFFICULTY_BREATHING","ALTERED_CONSCIOUSNESS","SEVERE_BLEEDING","STROKE_SYMPTOMS","ANAPHYLAXIS","PEDIATRIC_FEVER"],
  "clinicalSummary": "2-3 sentence clinical summary for the triage nurse",
  "differentials": [
    { "condition": string, "probability": "high"|"moderate"|"low", "reasoning": string }
  ],
  "recommendations": [
    { "action": string, "priority": "immediate"|"urgent"|"routine" }
  ],
  "redFlags": ["list any symptoms that suggest immediate escalation"]
}
`.trim();
}
