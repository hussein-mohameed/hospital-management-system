"use server";

import { loginSchema } from "@/lib/validations/visit";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { createSession, deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";

export type LoginState = {
  error?: string;
  errors?: {
    username?: string[];
    password?: string[];
  };
  success?: boolean;
} | null;

export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  const result = loginSchema.safeParse({ username, password });
  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  let shouldRedirect = false;

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      include: { doctor: true },
    });

    if (!user) {
      return {
        error: "اسم المستخدم أو كلمة المرور غير صحيحة | Username or password incorrect",
      };
    }

    const isPasswordValid = await compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return {
        error: "اسم المستخدم أو كلمة المرور غير صحيحة | Username or password incorrect",
      };
    }

    await createSession({
      userId: user.id,
      role: user.role,
      doctorId: user.doctor?.id || null,
      username: user.username,
    });

    shouldRedirect = true;
  } catch (error) {
    console.error("Login error:", error);
    return {
      error: "حدث خطأ ما أثناء تسجيل الدخول. يرجى المحاولة لاحقاً. | Connection error, please try again.",
    };
  }

  if (shouldRedirect) {
    redirect("/");
  }

  return null;
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}

