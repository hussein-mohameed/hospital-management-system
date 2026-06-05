"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const examSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب (2 أحرف على الأقل)"),
  category: z.string().min(2, "التصنيف مطلوب"),
  description: z.string().optional(),
  unit: z.string().optional(),
  normalRange: z.string().optional(),
});

export type ExamState = {
  error?: string;
  errors?: {
    name?: string[];
    category?: string[];
    description?: string[];
    unit?: string[];
    normalRange?: string[];
  };
  success?: boolean;
} | null;

export async function createExamination(prevState: ExamState, formData: FormData): Promise<ExamState> {
  const rawFields = {
    name: formData.get("name") as string,
    category: formData.get("category") as string,
    description: formData.get("description") as string,
    unit: formData.get("unit") as string,
    normalRange: formData.get("normalRange") as string,
  };

  const result = examSchema.safeParse(rawFields);
  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.examination.create({
      data: {
        name: result.data.name,
        category: result.data.category,
        description: result.data.description || null,
        unit: result.data.unit || null,
        normalRange: result.data.normalRange || null,
      },
    });
  } catch (error) {
    console.error("Create examination error:", error);
    return {
      error: "حدث خطأ ما أثناء إضافة الفحص. يرجى المحاولة لاحقاً. | Connection error, please try again.",
    };
  }

  revalidatePath("/examinations");
  return { success: true };
}

export async function updateExamResult(
  id: string,
  result: string,
  notes?: string
) {
  try {
    await prisma.visitExam.update({
      where: { id },
      data: {
        result,
        notes: notes || null,
        status: "COMPLETED",
        performedAt: new Date(),
      },
    });

    const visitExam = await prisma.visitExam.findUnique({
      where: { id },
      select: { visitId: true },
    });
    
    if (visitExam) {
      revalidatePath(`/visits/${visitExam.visitId}`);
    }
    revalidatePath("/examinations");
  } catch (error) {
    console.error("Update exam result error:", error);
    throw new Error("Failed to update examination result");
  }
}
