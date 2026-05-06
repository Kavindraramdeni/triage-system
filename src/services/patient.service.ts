import { prisma } from "@/lib/db/prisma";
import type { IntakeInput } from "@/lib/validation/intake.schema";

class PatientService {
  async createPatientVisit(data: IntakeInput) {
    const dob = new Date(data.dateOfBirth);

    // Check if a patient with this phone + DOB already exists (returning patient)
    let patient = await prisma.patient.findFirst({
      where: { phone: data.phone, dateOfBirth: dob },
    });

    if (!patient) {
      const mrn = this.generateMRN();
      patient = await prisma.patient.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: dob,
          phone: data.phone,
          email: data.email || null,
          mrn,
        },
      });
    }

    const visit = await prisma.visit.create({
      data: {
        patientId: patient.id,
        chiefComplaint: data.chiefComplaint,
        status: "WAITING",
      },
    });

    return { patient, visit };
  }

  async getStatusByToken(token: string) {
    return prisma.visit.findUnique({
      where: { accessToken: token },
      select: {
        status: true,
        esiLevel: true,
        queuePosition: true,
        arrivedAt: true,
      },
    });
  }

  private generateMRN(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `MRN-${timestamp}-${random}`;
  }
}

export const patientService = new PatientService();
