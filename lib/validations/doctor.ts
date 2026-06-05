import { z } from "zod";

export const doctorSchema = z.object({
  fullName: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل").max(100),
  specialty: z.string().min(2, "التخصص مطلوب"),
  phone: z
    .string()
    .regex(/^07[3-9]\d{8}$/, "رقم الهاتف غير صحيح")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
  username: z.string().min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل").max(50),
  email: z.string().email("ايميل غير صحيح"),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
});

export type DoctorInput = z.infer<typeof doctorSchema>;
