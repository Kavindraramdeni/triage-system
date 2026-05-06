import { NextRequest, NextResponse } from "next/server";
import { requireClinician } from "@/lib/auth/jwt";
import { clinicianService } from "@/services/clinician.service";
import { auditService } from "@/services/audit.service";
import { z } from "zod";

const overrideSchema = z.object({
  newEsi: z.enum(["ESI_1", "ESI_2", "ESI_3", "ESI_4", "ESI_5"]),
  reason: z.string().min(10, "Reason must be at least 10 characters").max(500),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { visitId: string } }
) {
  const auth = await requireClinician(req);
  if (!auth.ok) return auth.error;

  const body = await req.json();
  const parsed = overrideSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  // JWT sub contains the clinician's DB id
  const clinicianId = auth.clinician.sub as string;

  const override = await clinicianService.overrideEsi({
    visitId: params.visitId,
    clinicianId,
    newEsi: parsed.data.newEsi,
    reason: parsed.data.reason,
  });

  await auditService.log({
    clinicianId,
    action: "ESI_OVERRIDE",
    entityType: "Visit",
    entityId: params.visitId,
    afterState: override,
    req,
  });

  return NextResponse.json({ override });
}
