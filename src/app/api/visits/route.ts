import { NextRequest, NextResponse } from "next/server";
import { requireClinician } from "@/lib/auth/jwt";
import { clinicianService } from "@/services/clinician.service";

export async function GET(req: NextRequest) {
  const auth = await requireClinician(req);
  if (!auth.ok) return auth.error;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? undefined;
  const esiLevel = searchParams.get("esiLevel") ?? undefined;

  const queue = await clinicianService.getQueue({ status, esiLevel });
  return NextResponse.json({ queue });
}
