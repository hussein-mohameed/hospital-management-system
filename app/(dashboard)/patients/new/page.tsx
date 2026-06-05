import { requireSession } from "@/lib/session";
import { PatientForm } from "@/components/patients/PatientForm";

export default async function NewPatientPage() {
  // Ensure the user is logged in
  await requireSession();

  return (
    <div className="py-6">
      <PatientForm />
    </div>
  );
}
