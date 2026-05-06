import { prisma } from "@/lib/db/prisma";
import { QueueTable } from "@/components/dashboard/QueueTable";
import { StatsRow } from "@/components/dashboard/StatsRow";

export const dynamic = "force-dynamic";
export const metadata = { title: "Live Queue — TriageAI" };

export default async function DashboardPage() {
  const [rawQueue, stats] = await Promise.all([
    prisma.visit.findMany({
      where: {
        status: { notIn: ["DISCHARGED", "LEFT_WITHOUT_BEING_SEEN", "TRANSFERRED"] },
      },
      include: {
        patient: {
          select: { firstName: true, lastName: true, dateOfBirth: true, mrn: true },
        },
        triageAssessment: {
          select: {
            aiEsiLevel: true,
            aiUrgencyScore: true,
            aiUrgencyFlags: true,
            aiSummary: true,
            aiFallback: true,
          },
        },
      },
      orderBy: [{ arrivedAt: "asc" }],
    }),
    prisma.visit.groupBy({
      by: ["status"],
      _count: true,
      where: {
        status: { notIn: ["DISCHARGED", "LEFT_WITHOUT_BEING_SEEN", "TRANSFERRED"] },
      },
    }),
  ]);

  // Serialize dates to strings — Next.js server components can't pass Date objects to client components
  const queue = rawQueue.map((v) => ({
    ...v,
    arrivedAt: v.arrivedAt.toISOString(),
    seenAt: v.seenAt?.toISOString() ?? null,
    dischargedAt: v.dischargedAt?.toISOString() ?? null,
    createdAt: v.createdAt.toISOString(),
    updatedAt: v.updatedAt.toISOString(),
  }));

  const waiting = stats.find((s) => s.status === "WAITING")?._count ?? 0;
  const inTriage = stats.find((s) => s.status === "IN_TRIAGE")?._count ?? 0;
  const inTreatment = stats.find((s) => s.status === "IN_TREATMENT")?._count ?? 0;
  const critical = queue.filter(
    (v) => v.esiLevel === "ESI_1" || v.esiLevel === "ESI_2"
  ).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Live Triage Queue</h1>
          <p className="text-sm text-gray-500 mt-0.5">Updates in real-time via SSE</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Live
        </div>
      </div>

      <StatsRow
        waiting={waiting}
        inTriage={inTriage}
        inTreatment={inTreatment}
        critical={critical}
      />

      <QueueTable initialQueue={queue} />

      <footer className="text-center text-xs text-gray-400 pt-4 border-t border-gray-100">
        Built by{" "}
        <a href="https://github.com/Kavindraramdeni" className="hover:underline">
          Ramdeni Kavindra Raj
        </a>{" "}
        ·{" "}
        <a href="https://linkedin.com/in/kavindraraj" className="hover:underline">
          LinkedIn
        </a>
      </footer>
    </div>
  );
}
