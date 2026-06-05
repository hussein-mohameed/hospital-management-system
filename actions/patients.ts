"use server";

import { prisma } from "@/lib/prisma";
import { patientSchema } from "@/lib/validations/patient";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type PatientState = {
  error?: string;
  errors?: {
    fullName?: string[];
    dateOfBirth?: string[];
    region?: string[];
    email?: string[];
    phone?: string[];
    description?: string[];
  };
  success?: boolean;
} | null;

export async function createPatient(prevState: PatientState, formData: FormData): Promise<PatientState> {
  const rawFields = {
    fullName: formData.get("fullName") as string,
    dateOfBirth: formData.get("dateOfBirth") as string,
    region: formData.get("region") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    description: formData.get("description") as string,
  };

  const result = patientSchema.safeParse(rawFields);
  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  try {
    if (result.data.email) {
      const existing = await prisma.patient.findUnique({
        where: { email: result.data.email },
      });
      if (existing) {
        return {
          error: "البريد الإلكتروني مسجل بالفعل لمريض آخر | Email already registered for another patient",
        };
      }
    }

    await prisma.patient.create({
      data: {
        fullName: result.data.fullName,
        dateOfBirth: new Date(result.data.dateOfBirth),
        region: result.data.region,
        email: result.data.email || null,
        phone: result.data.phone,
        description: result.data.description || null,
      },
    });
  } catch (error) {
    console.error("Create patient error:", error);
    return {
      error: "حدث خطأ ما أثناء إضافة المريض. يرجى المحاولة لاحقاً. | Connection error, please try again.",
    };
  }

  revalidatePath("/patients");
  revalidatePath("/");
  redirect("/patients");
}

export async function updatePatient(
  id: string,
  prevState: PatientState,
  formData: FormData
): Promise<PatientState> {
  const rawFields = {
    fullName: formData.get("fullName") as string,
    dateOfBirth: formData.get("dateOfBirth") as string,
    region: formData.get("region") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    description: formData.get("description") as string,
  };

  const result = patientSchema.safeParse(rawFields);
  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  try {
    if (result.data.email) {
      const existing = await prisma.patient.findFirst({
        where: {
          email: result.data.email,
          NOT: { id },
        },
      });
      if (existing) {
        return {
          error: "البريد الإلكتروني مسجل بالفعل لمريض آخر | Email already registered for another patient",
        };
      }
    }

    await prisma.patient.update({
      where: { id },
      data: {
        fullName: result.data.fullName,
        dateOfBirth: new Date(result.data.dateOfBirth),
        region: result.data.region,
        email: result.data.email || null,
        phone: result.data.phone,
        description: result.data.description || null,
      },
    });
  } catch (error) {
    console.error("Update patient error:", error);
    return {
      error: "حدث خطأ ما أثناء تعديل بيانات المريض. يرجى المحاولة لاحقاً. | Connection error, please try again.",
    };
  }

  revalidatePath("/patients");
  revalidatePath(`/patients/${id}`);
  revalidatePath("/");
  redirect("/patients");
}

export async function togglePatientActive(id: string, active: boolean) {
  try {
    await prisma.patient.update({
      where: { id },
      data: { isActive: active },
    });
    revalidatePath("/patients");
    revalidatePath(`/patients/${id}`);
  } catch (error) {
    console.error("Toggle active error:", error);
    throw new Error("Failed to change patient status");
  }
}
