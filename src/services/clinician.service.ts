import { prisma } from "@/lib/db/prisma";
import { queueEmitter } from "@/lib/sse/queue.emitter";

class ClinicianService {
  async getQueue(filters: { status?: string; esiLevel?: string }) {
    return prisma.visit.findMany({
      where: {
        ...(filters.status ? { status: filters.status as any } : { status: { notIn: ["DISCHARGED", "LEFT_WITHOUT_BEING_SEEN", "TRANSFERRED"] } }),
        ...(filters.esiLevel ? { esiLevel: filters.esiLevel as any } : {}),
      },
      include: {
        patient: { select: { firstName: true, lastName: true, dateOfBirth: true, mrn: true } },
        triageAssessment: {
          select: { aiEsiLevel: true, aiUrgencyScore: true, aiUrgencyFlags: true, aiSummary: true, aiFallback: true },
        },
      },
      orderBy: [{ esiLevel: "asc" }, { arrivedAt: "asc" }],
    });
  }

  async getVisitDetail(visitId: string) {
    return prisma.visit.findUnique({
      where: { id: visitId },
      include: {
        patient: true,
        triageAssessment: true,
        overrides: { include: { clinician: { select: { name: true, role: true } } }, orderBy: { createdAt: "desc" } },
        clinician: { select: { name: true, role: true } },
      },
    });
  }

  async updateVisit(visitId: string, data: { status?: string; assignedTo?: string }) {
    const updated = await prisma.visit.update({
      where: { id: visitId },
      data: {
        ...(data.status ? { status: data.status as any } : {}),
        ...(data.assignedTo ? { assignedTo: data.assignedTo } : {}),
        ...(data.status === "IN_TRIAGE" ? { seenAt: new Date() } : {}),
        ...(data.status === "DISCHARGED" ? { dischargedAt: new Date() } : {}),
      },
    });

    queueEmitter.emit("queue:update", { type: "status_changed", visitId, status: data.status });
    return updated;
  }

  async overrideEsi(params: { visitId: string; clinicianId: string; newEsi: string; reason: string }) {
    const visit = await prisma.visit.findUniqueOrThrow({ where: { id: params.visitId } });

    const override = await prisma.triageOverride.create({
      data: {
        visitId: params.visitId,
        clinicianId: params.clinicianId,
        previousEsi: visit.esiLevel!,
        newEsi: params.newEsi as any,
        reason: params.reason,
      },
    });

    await prisma.visit.update({
      where: { id: params.visitId },
      data: { esiLevel: params.newEsi as any },
    });

    queueEmitter.emit("queue:update", { type: "esi_override", visitId: params.visitId, newEsi: params.newEsi });
    return override;
  }
}

export const clinicianService = new ClinicianService();
