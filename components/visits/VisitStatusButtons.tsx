"use client";

import { useState, useTransition } from "react";
import { updateVisitStatus } from "@/actions/visits";
import { VisitStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, PlayCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface VisitStatusButtonsProps {
  visitId: string;
  currentStatus: VisitStatus;
  lang: string;
}

const statusTransitions: Record<VisitStatus, VisitStatus | null> = {
  PENDING: "IN_PROGRESS",
  IN_PROGRESS: "COMPLETED",
  COMPLETED: null,
  CANCELLED: null,
};

export function VisitStatusButtons({ visitId, currentStatus, lang }: VisitStatusButtonsProps) {
  const [isPending, startTransition] = useTransition();
  const nextStatus = statusTransitions[currentStatus];

  const handleStatusChange = (status: VisitStatus) => {
    startTransition(async () => {
      await updateVisitStatus(visitId, status);
      const msgs: Record<VisitStatus, string> = {
        IN_PROGRESS: lang === "ar" ? "تم بدء الزيارة ✅" : "Visit started ✅",
        COMPLETED:   lang === "ar" ? "تم إكمال الزيارة 🎉" : "Visit completed 🎉",
        CANCELLED:   lang === "ar" ? "تم إلغاء الزيارة" : "Visit cancelled",
        PENDING:     "",
      };
      toast.success(msgs[status] || "", { duration: 3000 });
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {nextStatus === "IN_PROGRESS" && (
        <Button
          onClick={() => handleStatusChange("IN_PROGRESS")}
          disabled={isPending}
          className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl cursor-pointer gap-2"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <PlayCircle className="h-4 w-4" />
          )}
          {lang === "ar" ? "بدء الزيارة" : "Start Visit"}
        </Button>
      )}

      {nextStatus === "COMPLETED" && (
        <Button
          onClick={() => handleStatusChange("COMPLETED")}
          disabled={isPending}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl cursor-pointer gap-2"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          {lang === "ar" ? "إكمال الزيارة" : "Complete Visit"}
        </Button>
      )}

      {currentStatus !== "CANCELLED" && currentStatus !== "COMPLETED" && (
        <Button
          onClick={() => handleStatusChange("CANCELLED")}
          disabled={isPending}
          variant="ghost"
          className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 font-semibold rounded-xl cursor-pointer gap-2"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          {lang === "ar" ? "إلغاء الزيارة" : "Cancel Visit"}
        </Button>
      )}
    </div>
  );
}
