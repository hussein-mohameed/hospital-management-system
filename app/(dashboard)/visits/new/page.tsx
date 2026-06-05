import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { VisitForm } from "@/components/visits/VisitForm";

export default async function NewVisitPage() {
  // Ensure user is logged in
  await requireSession();

  // Fetch active patients, active doctors, and all examinations catalogs
  const [patients, doctors, examinations] = await Promise.all([
    prisma.patient.findMany({
      where: { isActive: true },
      select: { id: true, fullName: true },
      orderBy: { fullName: "asc" },
    }),
    prisma.doctor.findMany({
      where: { isActive: true },
      select: { id: true, fullName: true },
      orderBy: { fullName: "asc" },
    }),
    prisma.examination.findMany({
      select: { id: true, name: true, category: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="py-6">
      <VisitForm patients={patients} doctors={doctors} examinations={examinations} />
    </div>
  );
}
