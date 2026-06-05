import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { DoctorEditForm } from "@/components/doctors/DoctorEditForm";
import { notFound } from "next/navigation";

type Params = Promise<{ id: string }>;

export default async function EditDoctorPage({ params }: { params: Params }) {
  await requireSession();
  const { id } = await params;

  const doctor = await prisma.doctor.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!doctor) notFound();

  return (
    <div className="py-6">
      <DoctorEditForm doctor={doctor} />
    </div>
  );
}
