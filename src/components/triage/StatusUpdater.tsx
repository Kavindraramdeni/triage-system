"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUS_OPTIONS = [
  { value: "IN_TRIAGE", label: "Move to triage" },
  { value: "IN_TREATMENT", label: "Move to treatment" },
  { value: "DISCHARGED", label: "Discharge" },
  { value: "TRANSFERRED", label: "Transfer" },
  { value: "LEFT_WITHOUT_BEING_SEEN", label: "Left WOBS" },
];

const STATUS_COLORS: Record<string, string> = {
  WAITING: "bg-blue-100 text-blue-800",
  IN_TRIAGE: "bg-purple-100 text-purple-800",
  IN_TREATMENT: "bg-green-100 text-green-800",
  DISCHARGED: "bg-gray-100 text-gray-600",
  TRANSFERRED: "bg-orange-100 text-orange-800",
  LEFT_WITHOUT_BEING_SEEN: "bg-red-100 text-red-800",
};

export function StatusUpdater({ visitId, currentStatus }: { visitId: string; currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState("");

  async function updateStatus(status: string) {
    if (!status || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/visits/${visitId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error("Status update failed", err);
    } finally {
      setLoading(false);
      setSelected(""); // Reset select
    }
  }

  const available = STATUS_OPTIONS.filter(o => o.value !== currentStatus);
  const isTerminal = ["DISCHARGED", "LEFT_WITHOUT_BEING_SEEN", "TRANSFERRED"].includes(currentStatus);

  return (
    <div className="flex flex-col gap-2 min-w-[180px]">
      <span className={`text-xs px-3 py-1.5 rounded-full font-medium text-center ${STATUS_COLORS[currentStatus] ?? "bg-gray-100 text-gray-600"}`}>
        {currentStatus.replace(/_/g, " ")}
      </span>
      {!isTerminal && (
        <select
          disabled={loading}
          value={selected}
          onChange={e => {
            setSelected(e.target.value);
            updateStatus(e.target.value);
          }}
          className="text-xs px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 cursor-pointer disabled:opacity-50"
        >
          <option value="" disabled>{loading ? "Updating..." : "Change status..."}</option>
          {available.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      )}
    </div>
  );
}
