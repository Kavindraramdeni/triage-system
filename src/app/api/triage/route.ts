import { NextRequest, NextResponse } from "next/server";
import { triageService } from "@/services/triage.service";
import { triageInputSchema } from "@/lib/validation/triage.schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = triageInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    // Run AI analysis + persist assessment + broadcast SSE event
    const assessment = await triageService.runTriage(parsed.data);

    return NextResponse.json({ assessment }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/triage]", err);
    return NextResponse.json({ error: "Triage processing failed" }, { status: 500 });
  }
}
