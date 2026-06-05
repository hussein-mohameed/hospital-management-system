import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { PatientForm } from "@/components/patients/PatientForm";
import { notFound } from "next/navigation";

type Params = Promise<{ id: string }>;

export default async function EditPatientPage({
  params,
}: {
  params: Params;
}) {
  // Ensure the user is logged in
  await requireSession();

  // Await params (Next.js 16)
  const { id } = await params;

  // Fetch patient profile
  const patient = await prisma.patient.findUnique({
    where: { id },
  });

  if (!patient) {
    notFound();
  }

  return (
    <div className="py-6">
      <PatientForm initialData={patient} />
    </div>
  );
}
