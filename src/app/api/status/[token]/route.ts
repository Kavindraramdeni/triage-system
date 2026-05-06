import { NextRequest, NextResponse } from "next/server";
import { patientService } from "@/services/patient.service";

export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
  const visit = await patientService.getStatusByToken(params.token);
  if (!visit) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 404 });
  }

  // Return only what the patient needs — never expose clinical notes or AI internals
  return NextResponse.json({
    status: visit.status,
    esiLevel: visit.esiLevel,
    queuePosition: visit.queuePosition,
    arrivedAt: visit.arrivedAt,
    estimatedWaitMinutes: computeEstimatedWait(visit.esiLevel),
  });
}

function computeEstimatedWait(esiLevel: string | null): number | null {
  const waits: Record<string, number> = {
    ESI_1: 0,
    ESI_2: 10,
    ESI_3: 30,
    ESI_4: 60,
    ESI_5: 120,
  };
  return esiLevel ? (waits[esiLevel] ?? null) : null;
}
