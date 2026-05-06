import { ESI_COLORS, ESI_LABELS, type EsiLevel } from "@/types";

interface Props { level: EsiLevel; showLabel?: boolean; size?: "sm" | "md" | "lg"; }
const sizes = { sm: "text-xs px-2 py-0.5", md: "text-sm px-3 py-1", lg: "text-base px-4 py-1.5" };

export function EsiBadge({ level, showLabel = true, size = "md" }: Props) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${ESI_COLORS[level]} ${sizes[size]}`}>
      <span className="font-bold">{level.replace("ESI_", "")}</span>
      {showLabel && <span className="font-normal opacity-90">{ESI_LABELS[level]}</span>}
    </span>
  );
}
