import { z } from "zod";

const iraqiPhoneRegex = /^07[3-9]\d{8}$/;

export const patientSchema = z.object({
  fullName: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل").max(100),
  dateOfBirth: z.string().min(1, "تاريخ الميلاد مطلوب"),
  region: z.string().min(2, "المنطقة مطلوبة"),
  email: z
    .string()
    .email("ايميل غير صحيح")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
  phone: z
    .string()
    .regex(iraqiPhoneRegex, "رقم الهاتف يجب أن يكون عراقياً صحيحاً (07XXXXXXXXX)"),
  description: z.string().max(500).optional(),
});

export type PatientInput = z.infer<typeof patientSchema>;
