import { getTriageModel } from "@/lib/ai/gemini.client";
import { buildUserPrompt, SYSTEM_PROMPT } from "@/lib/ai/triage.prompt";
import { parseAiResponse } from "@/lib/ai/response.parser";
import { fallbackClassify } from "@/lib/ai/fallback.classifier";
import { prisma } from "@/lib/db/prisma";
import { queueEmitter } from "@/lib/sse/queue.emitter";
import type { TriageInput } from "@/types";

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

class TriageService {
  async runTriage(input: TriageInput) {
    const start = Date.now();
    let usedFallback = false;
    let aiResponse;
    let modelVersion = "gemini-1.5-pro";

    try {
      aiResponse = await this.callAiWithRetry(input);
    } catch (err) {
      console.error("[TriageService] AI failed, using fallback:", err);
      aiResponse = fallbackClassify(input);
      usedFallback = true;
      modelVersion = "rule-based-fallback";
    }

    const latencyMs = Date.now() - start;

    // Store recommendations as { items, redFlags } so redFlags are preserved
    const recommendationsPayload = {
      items: aiResponse.recommendations,
      redFlags: aiResponse.redFlags,
    };

    const assessment = await prisma.triageAssessment.create({
      data: {
        visitId: input.visitId,
        symptoms: input.symptoms,
        painScale: input.painScale,
        symptomDuration: input.symptomDuration,
        symptomOnset: input.symptomOnset,
        systolicBp: input.vitals?.systolicBp,
        diastolicBp: input.vitals?.diastolicBp,
        heartRate: input.vitals?.heartRate,
        temperature: input.vitals?.temperature,
        spo2: input.vitals?.spo2,
        respiratoryRate: input.vitals?.respiratoryRate,
        aiEsiLevel: aiResponse.esiLevel,
        aiUrgencyScore: aiResponse.urgencyScore,
        aiUrgencyFlags: aiResponse.urgencyFlags,
        aiSummary: aiResponse.clinicalSummary,
        aiDifferentials: aiResponse.differentials,
        aiRecommendations: recommendationsPayload,
        aiModel: modelVersion,
        aiLatencyMs: latencyMs,
        aiFallback: usedFallback,
      },
    });

    await prisma.visit.update({
      where: { id: input.visitId },
      data: { esiLevel: aiResponse.esiLevel, status: "WAITING" },
    });

    await this.recomputeQueuePositions();

    queueEmitter.emit("queue:update", {
      type: "new_patient",
      visitId: input.visitId,
      esiLevel: aiResponse.esiLevel,
      timestamp: new Date().toISOString(),
    });

    return assessment;
  }

  private async callAiWithRetry(input: TriageInput, attempt = 0): Promise<any> {
    try {
      const model = getTriageModel();
      const prompt = `${SYSTEM_PROMPT}\n\n${buildUserPrompt(input)}`;
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return parseAiResponse(text);
    } catch (err) {
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)));
        return this.callAiWithRetry(input, attempt + 1);
      }
      throw err;
    }
  }

  private async recomputeQueuePositions() {
    const waitingVisits = await prisma.visit.findMany({
      where: { status: "WAITING" },
      orderBy: [{ esiLevel: "asc" }, { arrivedAt: "asc" }],
      select: { id: true },
    });

    // Use sequential updates to avoid race conditions
    for (let i = 0; i < waitingVisits.length; i++) {
      await prisma.visit.update({
        where: { id: waitingVisits[i].id },
        data: { queuePosition: i + 1 },
      });
    }
  }
}

export const triageService = new TriageService();
