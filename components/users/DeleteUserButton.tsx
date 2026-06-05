"use client";

import { useTransition } from "react";
import { deleteUser } from "@/actions/users";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DeleteUserButtonProps {
  userId: string;
  username: string;
  lang: string;
}

export function DeleteUserButton({ userId, username, lang }: DeleteUserButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    const confirmed = window.confirm(
      lang === "ar"
        ? `هل أنت متأكد من حذف المستخدم @${username}؟`
        : `Are you sure you want to delete @${username}?`
    );
    if (!confirmed) return;

    startTransition(async () => {
      try {
        await deleteUser(userId);
        toast.success(
          lang === "ar" ? `تم حذف المستخدم @${username}` : `User @${username} deleted`,
          { duration: 3000 }
        );
      } catch (e: any) {
        toast.error(e?.message || (lang === "ar" ? "حدث خطأ أثناء الحذف" : "Delete failed"));
      }
    });
  };

  return (
    <Button
      onClick={handleDelete}
      disabled={isPending}
      variant="ghost"
      size="sm"
      className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl cursor-pointer gap-1.5 disabled:opacity-50"
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
      <span className="text-xs font-bold">{lang === "ar" ? "حذف" : "Delete"}</span>
    </Button>
  );
}

