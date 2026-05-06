import { prisma } from "@/lib/db/prisma";
import type { NextRequest } from "next/server";

class AuditService {
  async log(params: {
    clinicianId: string;
    action: string;
    entityType: string;
    entityId: string;
    beforeState?: unknown;
    afterState?: unknown;
    req: NextRequest;
  }) {
    if (!params.clinicianId) {
      console.error("[AuditService] Cannot log — clinicianId is missing");
      return;
    }

    try {
      await prisma.auditLog.create({
        data: {
          clinicianId: params.clinicianId,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId,
          beforeState: params.beforeState !== undefined
            ? (params.beforeState as any)
            : undefined,
          afterState: params.afterState !== undefined
            ? (params.afterState as any)
            : undefined,
          ipAddress:
            params.req.headers.get("x-forwarded-for") ??
            params.req.headers.get("x-real-ip") ??
            "unknown",
          userAgent: params.req.headers.get("user-agent") ?? "unknown",
        },
      });
    } catch (err) {
      // Audit log failure must never crash the main request
      console.error("[AuditService] Failed to write audit log:", err);
    }
  }
}

export const auditService = new AuditService();
