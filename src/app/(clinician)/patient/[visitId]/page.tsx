import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { AiAssessmentCard } from "@/components/triage/AiAssessmentCard";
import { EsiBadge } from "@/components/triage/EsiBadge";
import { OverridePanel } from "@/components/triage/OverridePanel";
import { StatusUpdater } from "@/components/triage/StatusUpdater";
import type { EsiLevel } from "@/types";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PatientDetailPage({ params }: { params: Promise<{ visitId: string }> }) {
  const { visitId } = await params;
  const visit = await prisma.visit.findUnique({
    where: { id: visitId },
    include: {
      patient: true,
      triageAssessment: true,
      overrides: {
        include: { clinician: { select: { name: true, role: true } } },
        orderBy: { createdAt: "desc" },
      },
      clinician: { select: { name: true } },
    },
  });

  if (!visit) notFound();

  const age = Math.floor((Date.now() - new Date(visit.patient.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365));
  const ta = visit.triageAssessment;
  const waitMins = Math.round((Date.now() - new Date(visit.arrivedAt).getTime()) / 60000);

  // Extract from the stored recommendations payload { items, redFlags }
  const recommendations = ta ? ((ta.aiRecommendations as any)?.items ?? ta.aiRecommendations ?? []) : [];
  const redFlags = ta ? ((ta.aiRecommendations as any)?.redFlags ?? []) : [];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <Link href="/dashboard" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
        ← Back to queue
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-bold text-gray-900">
              {visit.patient.firstName} {visit.patient.lastName}
            </h1>
            {visit.esiLevel && <EsiBadge level={visit.esiLevel as EsiLevel} />}
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span>MRN: <span className="font-mono text-gray-700">{visit.patient.mrn}</span></span>
            <span>Age: <span className="text-gray-700">{age} years</span></span>
            <span>Waited: <span className="text-gray-700">{waitMins} min</span></span>
            <span>Status: <span className="font-medium text-gray-700">{visit.status}</span></span>
          </div>
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-400 mb-0.5">Chief complaint</p>
            <p className="text-sm text-gray-800 italic">"{visit.chiefComplaint}"</p>
          </div>
        </div>
        <StatusUpdater visitId={visit.id} currentStatus={visit.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">AI Triage Assessment</h2>
          {ta ? (
            <AiAssessmentCard
              esiLevel={ta.aiEsiLevel as EsiLevel}
              urgencyScore={ta.aiUrgencyScore}
              clinicalSummary={ta.aiSummary}
              differentials={ta.aiDifferentials as any}
              recommendations={recommendations}
              redFlags={redFlags}
              isFallback={ta.aiFallback}
              aiModel={ta.aiModel}
              latencyMs={ta.aiLatencyMs}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-gray-400 text-sm">
              Awaiting symptom entry from patient
            </div>
          )}
        </div>

        <div className="space-y-4">
          {ta && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Vitals at intake</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: "Blood pressure", value: ta.systolicBp && ta.diastolicBp ? `${ta.systolicBp}/${ta.diastolicBp} mmHg` : null },
                  { label: "Heart rate", value: ta.heartRate ? `${ta.heartRate} bpm` : null },
                  { label: "Temperature", value: ta.temperature ? `${ta.temperature}°C` : null },
                  { label: "SpO₂", value: ta.spo2 ? `${ta.spo2}%` : null },
                  { label: "Pain scale", value: `${ta.painScale}/10` },
                  { label: "Onset", value: ta.symptomOnset },
                  { label: "Duration", value: ta.symptomDuration },
                ].map(({ label, value }) => value ? (
                  <div key={label}>
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="font-medium text-gray-800">{value}</p>
                  </div>
                ) : null)}
              </div>
            </div>
          )}

          {visit.esiLevel && (
            <OverridePanel visitId={visit.id} currentEsi={visit.esiLevel as EsiLevel} />
          )}

          {visit.overrides.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Override history</h2>
              <div className="space-y-3">
                {visit.overrides.map((o: (typeof visit.overrides)[number]) => (
                  <div key={o.id} className="text-sm border-l-2 border-amber-400 pl-3">
                    <p className="text-gray-700">
                      <span className="font-medium">{o.clinician.name}</span> changed{" "}
                      <span className="font-mono">{o.previousEsi}</span> → <span className="font-mono">{o.newEsi}</span>
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">"{o.reason}"</p>
                    <p className="text-gray-400 text-xs">{new Date(o.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
