import type { TriageInputRaw } from "@/lib/validation/triage.schema";

export type EsiLevel = "ESI_1" | "ESI_2" | "ESI_3" | "ESI_4" | "ESI_5";

// Full triage input — schema fields + enriched fields added server-side from session
export type TriageInput = TriageInputRaw & {
  age: number;
  sex: string;
  chiefComplaint: string;
};

export const ESI_COLORS: Record<EsiLevel, string> = {
  ESI_1: "bg-red-600 text-white",
  ESI_2: "bg-orange-500 text-white",
  ESI_3: "bg-yellow-400 text-black",
  ESI_4: "bg-green-500 text-white",
  ESI_5: "bg-blue-400 text-white",
};

export const ESI_LABELS: Record<EsiLevel, string> = {
  ESI_1: "Resuscitation — immediate",
  ESI_2: "Emergent — high risk",
  ESI_3: "Urgent — stable",
  ESI_4: "Less urgent",
  ESI_5: "Non-urgent",
};
