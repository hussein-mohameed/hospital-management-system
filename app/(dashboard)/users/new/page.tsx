import { requireSession } from "@/lib/session";
import { UserForm } from "@/components/users/UserForm";
import { redirect } from "next/navigation";

export default async function NewUserPage() {
  const session = await requireSession();

  // Only Super Admin / Admin can add users
  if (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="py-6">
      <UserForm />
    </div>
  );
}
