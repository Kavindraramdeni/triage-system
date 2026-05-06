interface Props { waiting: number; inTriage: number; inTreatment: number; critical: number; }

export function StatsRow({ waiting, inTriage, inTreatment, critical }: Props) {
  const cards = [
    { label: "Waiting", value: waiting, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "In triage", value: inTriage, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "In treatment", value: inTreatment, color: "text-green-600", bg: "bg-green-50" },
    { label: "Critical (ESI 1–2)", value: critical, color: "text-red-600", bg: "bg-red-50" },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(c => (
        <div key={c.label} className={`${c.bg} rounded-xl p-4`}>
          <p className="text-xs font-medium text-gray-500">{c.label}</p>
          <p className={`text-3xl font-bold mt-1 ${c.color}`}>{c.value}</p>
        </div>
      ))}
    </div>
  );
}
