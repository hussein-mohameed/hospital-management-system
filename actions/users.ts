"use server";

import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

// ── Create User ──────────────────────────────────────────────
const createUserSchema = z.object({
  username: z.string().min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
  role: z.nativeEnum(Role),
});

export type UserState = {
  error?: string;
  errors?: {
    username?: string[];
    email?: string[];
    password?: string[];
    role?: string[];
  };
  success?: boolean;
} | null;

export async function createUser(prevState: UserState, formData: FormData): Promise<UserState> {
  const raw = {
    username: formData.get("username") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    role: formData.get("role") as string,
  };

  const result = createUserSchema.safeParse(raw);
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  try {
    const exists = await prisma.user.findFirst({
      where: {
        OR: [{ username: result.data.username }, { email: result.data.email }],
      },
    });

    if (exists) {
      return {
        error: "اسم المستخدم أو البريد الإلكتروني مسجل بالفعل | Username or email already exists",
      };
    }

    const passwordHash = await hash(result.data.password, 10);

    await prisma.user.create({
      data: {
        username: result.data.username,
        email: result.data.email,
        passwordHash,
        role: result.data.role,
      },
    });
  } catch (error) {
    console.error("Create user error:", error);
    return {
      error: "حدث خطأ أثناء إنشاء المستخدم. يرجى المحاولة مرة أخرى.",
    };
  }

  revalidatePath("/users");
  redirect("/users");
}

// ── Toggle User Active (via role reset or soft delete) ──────
export async function deleteUser(id: string) {
  try {
    // Prevent deleting the last SUPER_ADMIN
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error("User not found");

    if (user.role === "SUPER_ADMIN") {
      const adminCount = await prisma.user.count({ where: { role: "SUPER_ADMIN" } });
      if (adminCount <= 1) {
        throw new Error("لا يمكن حذف المدير الوحيد في النظام");
      }
    }

    // If doctor, also delete the doctor profile
    await prisma.user.delete({ where: { id } });
  } catch (error) {
    console.error("Delete user error:", error);
    throw error;
  }

  revalidatePath("/users");
}
