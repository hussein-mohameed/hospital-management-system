"use server";

import { prisma } from "@/lib/prisma";
import { CaseStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function upsertReport(visitId: string, content: string, status: CaseStatus) {
  try {
    const report = await prisma.report.upsert({
      where: { visitId },
      create: {
        visitId,
        content,
        status,
      },
      update: {
        content,
        status,
      },
    });

    revalidatePath(`/visits/${visitId}`);
    revalidatePath("/reports");
    return report;
  } catch (error) {
    console.error("Upsert report error:", error);
    throw new Error("Failed to save report");
  }
}
