"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EsiBadge } from "./EsiBadge";
import type { EsiLevel } from "@/types";

const ESI_OPTIONS: EsiLevel[] = ["ESI_1", "ESI_2", "ESI_3", "ESI_4", "ESI_5"];

export function OverridePanel({ visitId, currentEsi }: { visitId: string; currentEsi: EsiLevel }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [newEsi, setNewEsi] = useState<EsiLevel>(currentEsi);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (reason.trim().length < 10) { setError("Reason must be at least 10 characters."); return; }
    if (newEsi === currentEsi) { setError("Select a different ESI level to override."); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch(`/api/visits/${visitId}/override`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEsi, reason: reason.trim() }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error ?? "Failed"); return; }
      setOpen(false);
      setReason("");
      router.refresh();
    } catch { setError("Network error."); }
    finally { setLoading(false); }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">ESI Level</h2>
          <EsiBadge level={currentEsi} size="md" />
        </div>
        <button onClick={() => setOpen(!open)}
          className="text-xs px-3 py-1.5 rounded-lg border border-amber-300 text-amber-700 hover:bg-amber-50 transition-colors">
          Override
        </button>
      </div>

      {open && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">New ESI level</label>
            <div className="flex flex-wrap gap-2">
              {ESI_OPTIONS.map(level => (
                <button key={level} type="button" onClick={() => setNewEsi(level)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-all
                    ${newEsi === level ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
                  {level.replace("ESI_", "")}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Reason <span className="text-gray-400">(required, min 10 chars)</span></label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={2}
              placeholder="Clinical justification for ESI change..."
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none focus:border-blue-500 outline-none" />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button onClick={submit} disabled={loading}
              className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white text-sm font-semibold py-2 rounded-lg transition-colors">
              {loading ? "Saving..." : "Confirm override"}
            </button>
            <button onClick={() => { setOpen(false); setError(""); }}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
