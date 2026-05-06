import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { ESI_COLORS, type EsiLevel } from "@/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Queue Status — TriageAI" };

const STATUS_LABELS: Record<string, string> = {
  WAITING: "Waiting to be seen",
  IN_TRIAGE: "Currently being triaged",
  IN_TREATMENT: "In treatment",
  DISCHARGED: "Discharged",
  LEFT_WITHOUT_BEING_SEEN: "Left without being seen",
  TRANSFERRED: "Transferred",
};

const WAIT_ESTIMATES: Record<string, string> = {
  ESI_1: "Immediate",
  ESI_2: "~10 minutes",
  ESI_3: "~30 minutes",
  ESI_4: "~60 minutes",
  ESI_5: "~2 hours",
};

export default async function StatusPage({ params }: { params: { token: string } }) {
  const visit = await prisma.visit.findUnique({
    where: { accessToken: params.token },
    select: { status: true, esiLevel: true, queuePosition: true, arrivedAt: true },
  });

  if (!visit) notFound();

  const waitMins = Math.round((Date.now() - new Date(visit.arrivedAt).getTime()) / 60000);
  const isActive = !["DISCHARGED", "LEFT_WITHOUT_BEING_SEEN", "TRANSFERRED"].includes(visit.status);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Your Queue Status</h1>
          <p className="text-sm text-gray-500 mt-1">Auto-refreshes every 30 seconds.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Current status</p>
              <p className="font-semibold text-gray-900">{STATUS_LABELS[visit.status] ?? visit.status}</p>
            </div>
            <div className={`w-3 h-3 rounded-full ${isActive ? "bg-green-500 animate-pulse" : "bg-gray-300"}`} />
          </div>

          {visit.queuePosition && isActive && (
            <div className="text-center py-4 border-t border-b border-gray-100 my-4">
              <p className="text-xs text-gray-400 mb-1">Queue position</p>
              <p className="text-5xl font-bold text-blue-600">#{visit.queuePosition}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
            <div>
              <p className="text-xs text-gray-400">Waited</p>
              <p className="font-medium">
                {waitMins < 60 ? `${waitMins} min` : `${Math.floor(waitMins / 60)}h ${waitMins % 60}m`}
              </p>
            </div>
            {visit.esiLevel && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Priority level</p>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${ESI_COLORS[visit.esiLevel as EsiLevel]}`}>
                  {visit.esiLevel.replace("ESI_", "Level ")}
                </span>
              </div>
            )}
            {visit.esiLevel && WAIT_ESTIMATES[visit.esiLevel] && isActive && (
              <div>
                <p className="text-xs text-gray-400">Estimated wait</p>
                <p className="font-medium">{WAIT_ESTIMATES[visit.esiLevel]}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          <strong>If your condition worsens</strong> — do not wait. Alert the triage desk immediately or ask for help.
        </div>

        {/* Auto-refresh without dangerouslySetInnerHTML */}
        <meta httpEquiv="refresh" content="30" />
      </div>
    </main>
  );
}
