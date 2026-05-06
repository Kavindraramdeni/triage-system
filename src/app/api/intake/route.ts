import { NextRequest, NextResponse } from "next/server";
import { patientService } from "@/services/patient.service";
import { intakeSchema } from "@/lib/validation/intake.schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = intakeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { patient, visit } = await patientService.createPatientVisit(parsed.data);

    return NextResponse.json(
      {
        visitId: visit.id,
        accessToken: visit.accessToken,
        mrn: patient.mrn,
        message: "Intake recorded. Proceed to symptom entry.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/intake]", err);
    return NextResponse.json({ error: "Failed to register intake" }, { status: 500 });
  }
}
