"use server";

import { prisma } from "@/lib/prisma";
import { visitSchema } from "@/lib/validations/visit";
import { VisitStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type VisitState = {
  error?: string;
  errors?: {
    patientId?: string[];
    visitDate?: string[];
    chiefComplaint?: string[];
    notes?: string[];
    doctorIds?: string[];
    examinationIds?: string[];
  };
  success?: boolean;
} | null;

export async function createVisit(prevState: VisitState, formData: FormData): Promise<VisitState> {
  const patientId = formData.get("patientId") as string;
  const visitDate = formData.get("visitDate") as string;
  const chiefComplaint = formData.get("chiefComplaint") as string;
  const notes = formData.get("notes") as string;
  
  // Handle array inputs from checkbox list or multi-select
  const doctorIds = formData.getAll("doctorIds") as string[];
  const examinationIds = formData.getAll("examinationIds") as string[];

  const result = visitSchema.safeParse({
    patientId,
    visitDate,
    chiefComplaint,
    notes: notes || undefined,
    doctorIds,
    examinationIds,
  });

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.visit.create({
      data: {
        patientId: result.data.patientId,
        visitDate: new Date(result.data.visitDate),
        chiefComplaint: result.data.chiefComplaint,
        notes: result.data.notes || null,
        doctors: {
          create: result.data.doctorIds.map((doctorId) => ({
            doctorId,
          })),
        },
        examinations: {
          create: result.data.examinationIds?.map((examinationId) => ({
            examinationId,
            status: "PENDING",
          })) || [],
        },
      },
    });
  } catch (error) {
    console.error("Create visit error:", error);
    return {
      error: "حدث خطأ ما أثناء إنشاء الزيارة. يرجى المحاولة لاحقاً. | Connection error, please try again.",
    };
  }

  revalidatePath("/visits");
  revalidatePath("/");
  redirect("/visits");
}

export async function updateVisitStatus(id: string, status: VisitStatus) {
  try {
    await prisma.visit.update({
      where: { id },
      data: { status },
    });
    revalidatePath("/visits");
    revalidatePath(`/visits/${id}`);
    revalidatePath("/");
  } catch (error) {
    console.error("Update visit status error:", error);
    throw new Error("Failed to update visit status");
  }
}

export async function updateVisitDiagnosis(id: string, diagnosis: string) {
  try {
    await prisma.visit.update({
      where: { id },
      data: { diagnosis },
    });
    revalidatePath(`/visits/${id}`);
  } catch (error) {
    console.error("Update visit diagnosis error:", error);
    throw new Error("Failed to update diagnosis");
  }
}
