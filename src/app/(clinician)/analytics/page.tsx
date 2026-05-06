import { prisma } from "@/lib/db/prisma";
import { AnalyticsCharts } from "@/components/dashboard/AnalyticsCharts";

export const dynamic = "force-dynamic";
export const metadata = { title: "Analytics — TriageAI" };

export default async function AnalyticsPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [esiDist, statusDist, todayVisits, avgWait, fallbackCount] = await Promise.all([
    // ESI level distribution (all time)
    prisma.visit.groupBy({
      by: ["esiLevel"],
      _count: true,
      where: { esiLevel: { not: null } },
    }),
    // Status distribution (active)
    prisma.visit.groupBy({
      by: ["status"],
      _count: true,
    }),
    // Today's visits
    prisma.visit.count({ where: { arrivedAt: { gte: today } } }),
    // Avg wait time for seen patients today
    prisma.visit.findMany({
      where: { arrivedAt: { gte: today }, seenAt: { not: null } },
      select: { arrivedAt: true, seenAt: true },
    }),
    // AI fallback usage
    prisma.triageAssessment.count({ where: { aiFallback: true } }),
  ]);

  const avgWaitMins = avgWait.length
    ? Math.round(avgWait.reduce((sum: number, v: { arrivedAt: Date; seenAt: Date | null }) => sum + (new Date(v.seenAt!).getTime() - new Date(v.arrivedAt).getTime()), 0) / avgWait.length / 60000)
    : null;

  const totalAssessments = await prisma.triageAssessment.count();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Today's performance and historical trends</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Patients today", value: todayVisits.toString(), sub: "arrived since midnight" },
          { label: "Avg wait (today)", value: avgWaitMins !== null ? `${avgWaitMins}m` : "—", sub: "time to first seen" },
          { label: "AI assessments", value: totalAssessments.toString(), sub: "total triage runs" },
          { label: "Fallback rate", value: totalAssessments ? `${Math.round((fallbackCount / totalAssessments) * 100)}%` : "0%", sub: "rule-based fallback used" },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs text-gray-400">{k.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{k.value}</p>
            <p className="text-xs text-gray-400 mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      <AnalyticsCharts esiDist={esiDist as any} statusDist={statusDist as any} />
    </div>
  );
}
