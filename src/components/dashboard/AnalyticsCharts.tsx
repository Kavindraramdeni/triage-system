"use client";

interface GroupItem { esiLevel?: string | null; status?: string; _count: number; }

const ESI_COLORS: Record<string, string> = {
  ESI_1: "bg-red-600",
  ESI_2: "bg-orange-500",
  ESI_3: "bg-yellow-400",
  ESI_4: "bg-green-500",
  ESI_5: "bg-blue-400",
};

const STATUS_COLORS: Record<string, string> = {
  WAITING: "bg-blue-500",
  IN_TRIAGE: "bg-purple-500",
  IN_TREATMENT: "bg-green-500",
  DISCHARGED: "bg-gray-400",
  TRANSFERRED: "bg-orange-400",
  LEFT_WITHOUT_BEING_SEEN: "bg-red-400",
};

function BarChart({ data, colorMap, labelKey }: { data: GroupItem[]; colorMap: Record<string, string>; labelKey: "esiLevel" | "status" }) {
  const total = data.reduce((s, d) => s + d._count, 0);
  if (total === 0) return <p className="text-sm text-gray-400 py-4 text-center">No data yet</p>;
  return (
    <div className="space-y-3">
      {data.filter(d => d[labelKey]).sort((a, b) => b._count - a._count).map(d => {
        const key = d[labelKey] as string;
        const pct = Math.round((d._count / total) * 100);
        return (
          <div key={key} className="flex items-center gap-3 text-sm">
            <span className="text-gray-500 w-36 shrink-0 truncate">{key.replace(/_/g, " ")}</span>
            <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${colorMap[key] ?? "bg-gray-400"}`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-gray-600 font-medium w-12 text-right">{d._count} <span className="text-gray-400 font-normal">({pct}%)</span></span>
          </div>
        );
      })}
    </div>
  );
}

export function AnalyticsCharts({ esiDist, statusDist }: { esiDist: GroupItem[]; statusDist: GroupItem[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">ESI distribution (all time)</h2>
        <BarChart data={esiDist} colorMap={ESI_COLORS} labelKey="esiLevel" />
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Visit status breakdown</h2>
        <BarChart data={statusDist} colorMap={STATUS_COLORS} labelKey="status" />
      </div>
    </div>
  );
}
