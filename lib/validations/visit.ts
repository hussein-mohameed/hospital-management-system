import { z } from "zod";

export const visitSchema = z.object({
  patientId: z.string().min(1, "يجب اختيار مريض"),
  visitDate: z.string().min(1, "تاريخ الزيارة مطلوب"),
  chiefComplaint: z.string().min(5, "وصف الشكوى مطلوب"),
  notes: z.string().optional(),
  doctorIds: z.array(z.string()).min(1, "يجب تحديد دكتور واحد على الأقل"),
  examinationIds: z.array(z.string()).optional().default([]),
});

export const loginSchema = z.object({
  username: z.string().min(1, "اسم المستخدم مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

export type VisitInput = z.infer<typeof visitSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
