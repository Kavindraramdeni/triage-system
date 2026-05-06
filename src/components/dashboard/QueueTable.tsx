"use client";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueueSSE } from "@/hooks/useQueueSSE";
import { EsiBadge } from "@/components/triage/EsiBadge";
import type { EsiLevel } from "@/types";

interface QueueVisit {
  id: string;
  status: string;
  esiLevel: EsiLevel | null;
  queuePosition: number | null;
  arrivedAt: string;
  patient: { firstName: string; lastName: string; mrn: string };
  triageAssessment?: { aiSummary: string; aiFallback: boolean } | null;
}

export function QueueTable({ initialQueue }: { initialQueue: QueueVisit[] }) {
  const router = useRouter();

  // Stable reference — won't cause SSE reconnect on every render
  const handleEvent = useCallback(() => {
    router.refresh();
  }, [router]);

  useQueueSSE(handleEvent);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {["#", "Patient", "Summary", "ESI", "Wait", "Status"].map(h => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {initialQueue.map(v => {
            const wait = Math.round((Date.now() - new Date(v.arrivedAt).getTime()) / 60000);
            return (
              <tr
                key={v.id}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => router.push(`/patient/${v.id}`)}
              >
                <td className="px-4 py-3 font-mono text-gray-400">{v.queuePosition ?? "—"}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{v.patient.firstName} {v.patient.lastName}</p>
                  <p className="text-xs text-gray-400">{v.patient.mrn}</p>
                </td>
                <td className="px-4 py-3 max-w-xs">
                  <p className="text-xs text-gray-600 truncate">
                    {v.triageAssessment?.aiSummary ?? "Pending assessment"}
                  </p>
                  {v.triageAssessment?.aiFallback && (
                    <span className="text-xs text-amber-600 font-medium">Fallback</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {v.esiLevel
                    ? <EsiBadge level={v.esiLevel} showLabel={false} />
                    : <span className="text-gray-400 text-xs">Pending</span>
                  }
                </td>
                <td className="px-4 py-3 text-gray-500">{wait}m</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    {v.status.replace(/_/g, " ")}
                  </span>
                </td>
              </tr>
            );
          })}
          {initialQueue.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-16 text-center text-gray-400">
                <p className="font-medium">Queue is empty</p>
                <p className="text-xs mt-1">Patients will appear here after intake</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
