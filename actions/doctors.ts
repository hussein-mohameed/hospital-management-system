"use server";

import { prisma } from "@/lib/prisma";
import { doctorSchema } from "@/lib/validations/doctor";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type DoctorState = {
  error?: string;
  errors?: {
    fullName?: string[];
    specialty?: string[];
    phone?: string[];
    username?: string[];
    email?: string[];
    password?: string[];
  };
  success?: boolean;
} | null;

export async function createDoctor(prevState: DoctorState, formData: FormData): Promise<DoctorState> {
  const rawFields = {
    fullName: formData.get("fullName") as string,
    specialty: formData.get("specialty") as string,
    phone: formData.get("phone") as string,
    username: formData.get("username") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const result = doctorSchema.safeParse(rawFields);
  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: result.data.username },
          { email: result.data.email },
        ]
      }
    });

    if (existingUser) {
      return {
        error: "اسم المستخدم أو البريد الإلكتروني مسجل بالفعل | Username or email already registered",
      };
    }

    const passwordHash = await bcrypt.hash(result.data.password, 10);

    await prisma.user.create({
      data: {
        username: result.data.username,
        email: result.data.email,
        passwordHash,
        role: "DOCTOR",
        doctor: {
          create: {
            fullName: result.data.fullName,
            specialty: result.data.specialty,
            phone: result.data.phone || null,
          }
        }
      }
    });
  } catch (error) {
    console.error("Create doctor error:", error);
    return {
      error: "حدث خطأ ما أثناء إضافة الطبيب. يرجى المحاولة لاحقاً. | Connection error, please try again.",
    };
  }

  revalidatePath("/doctors");
  revalidatePath("/");
  redirect("/doctors");
}

export async function toggleDoctorActive(id: string, active: boolean) {
  try {
    await prisma.doctor.update({
      where: { id },
      data: { isActive: active },
    });
    revalidatePath("/doctors");
    revalidatePath(`/doctors/${id}`);
  } catch (error) {
    console.error("Toggle doctor active error:", error);
    throw new Error("Failed to change doctor status");
  }
}

export type UpdateDoctorState = {
  error?: string;
  errors?: {
    fullName?: string[];
    specialty?: string[];
    phone?: string[];
  };
  success?: boolean;
} | null;

export async function updateDoctor(
  id: string,
  prevState: UpdateDoctorState,
  formData: FormData
): Promise<UpdateDoctorState> {
  const fullName = formData.get("fullName") as string;
  const specialty = formData.get("specialty") as string;
  const phone = formData.get("phone") as string;
  const isActive = formData.get("isActive") === "true";

  if (!fullName || fullName.length < 2) {
    return { errors: { fullName: ["الاسم مطلوب (2 أحرف على الأقل)"] } };
  }
  if (!specialty || specialty.length < 2) {
    return { errors: { specialty: ["التخصص مطلوب"] } };
  }

  try {
    await prisma.doctor.update({
      where: { id },
      data: {
        fullName,
        specialty,
        phone: phone || null,
        isActive,
      },
    });
  } catch (error) {
    console.error("Update doctor error:", error);
    return {
      error: "حدث خطأ أثناء التحديث. يرجى المحاولة مرة أخرى.",
    };
  }

  revalidatePath("/doctors");
  revalidatePath(`/doctors/${id}`);
  redirect(`/doctors/${id}`);
}
