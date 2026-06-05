import { requireSession } from "@/lib/session";
import { DoctorForm } from "@/components/doctors/DoctorForm";

export default async function NewDoctorPage() {
  // Ensure the user is logged in
  await requireSession();

  return (
    <div className="py-6">
      <DoctorForm />
    </div>
  );
}
