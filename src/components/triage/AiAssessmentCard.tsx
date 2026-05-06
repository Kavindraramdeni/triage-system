"use client";
import { EsiBadge } from "./EsiBadge";
import type { EsiLevel } from "@/types";

interface Props {
  esiLevel: EsiLevel;
  urgencyScore: number;
  clinicalSummary: string;
  differentials: { condition: string; probability: string; reasoning: string }[];
  recommendations: { action: string; priority: string }[];
  redFlags: string[];
  isFallback: boolean;
  aiModel: string;
  latencyMs: number;
}

export function AiAssessmentCard(p: Props) {
  const prioColors: Record<string, string> = {
    immediate: "bg-red-100 text-red-800",
    urgent: "bg-amber-100 text-amber-800",
    routine: "bg-green-100 text-green-800",
  };
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-5">
      {p.isFallback && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-2 text-sm text-amber-800">
          AI service unavailable — rule-based fallback used. Manual review required.
        </div>
      )}
      <div className="flex items-center justify-between">
        <div><p className="text-xs text-gray-500 mb-1">AI recommendation</p><EsiBadge level={p.esiLevel} size="lg" /></div>
        <div className="text-right"><p className="text-xs text-gray-400">Confidence</p><p className="text-2xl font-semibold">{Math.round(p.urgencyScore * 100)}%</p></div>
      </div>
      {p.redFlags.length > 0 && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3">
          <p className="text-xs font-semibold text-red-700 mb-1">Red flags</p>
          {p.redFlags.map((f, i) => <p key={i} className="text-sm text-red-700">• {f}</p>)}
        </div>
      )}
      <div><p className="text-xs font-semibold text-gray-500 mb-1">Clinical summary</p><p className="text-sm text-gray-700 leading-relaxed">{p.clinicalSummary}</p></div>
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">Differentials</p>
        {p.differentials.map((d, i) => (
          <div key={i} className="text-sm mb-1">
            <span className="font-medium text-gray-800">{d.condition}</span>
            <span className="text-gray-400 ml-1">({d.probability})</span>
            <span className="text-gray-500 ml-1">— {d.reasoning}</span>
          </div>
        ))}
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">Recommended actions</p>
        {p.recommendations.map((r, i) => (
          <div key={i} className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${prioColors[r.priority] ?? "bg-gray-100 text-gray-700"}`}>{r.priority}</span>
            <span className="text-sm text-gray-700">{r.action}</span>
          </div>
        ))}
      </div>
      <div className="pt-2 border-t border-gray-100 flex justify-between text-xs text-gray-400">
        <span>Model: {p.aiModel}</span><span>Latency: {p.latencyMs}ms</span>
      </div>
    </div>
  );
}
