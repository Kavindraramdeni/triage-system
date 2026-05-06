import { NextRequest, NextResponse } from "next/server";
import { requireClinician } from "@/lib/auth/jwt";
import { clinicianService } from "@/services/clinician.service";
import { auditService } from "@/services/audit.service";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["IN_TRIAGE", "IN_TREATMENT", "DISCHARGED", "TRANSFERRED", "LEFT_WITHOUT_BEING_SEEN"]).optional(),
  assignedTo: z.string().cuid().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { visitId: string } }
) {
  const auth = await requireClinician(req);
  if (!auth.ok) return auth.error;

  const visit = await clinicianService.getVisitDetail(params.visitId);
  if (!visit) return NextResponse.json({ error: "Visit not found" }, { status: 404 });

  return NextResponse.json({ visit });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { visitId: string } }
) {
  const auth = await requireClinician(req);
  if (!auth.ok) return auth.error;

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update payload" }, { status: 422 });
  }

  const before = await clinicianService.getVisitDetail(params.visitId);
  const updated = await clinicianService.updateVisit(params.visitId, parsed.data);

  await auditService.log({
    clinicianId: auth.clinician.sub as string,
    action: "STATUS_CHANGED",
    entityType: "Visit",
    entityId: params.visitId,
    beforeState: before,
    afterState: updated,
    req,
  });

  return NextResponse.json({ visit: updated });
}
