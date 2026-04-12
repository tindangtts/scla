"use client";

import { useActionState } from "react";
import { markAsReadAction, markAllAsReadAction } from "./actions";
import { Button } from "@/components/ui/button";

export function MarkAsReadButton({ notificationId }: { notificationId: string }) {
  const [, formAction, isPending] = useActionState(markAsReadAction, {});

  return (
    <form action={formAction}>
      <input type="hidden" name="notificationId" value={notificationId} />
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        className="text-[11px] shrink-0 h-7 font-bold"
        disabled={isPending}
      >
        {isPending ? "..." : "Mark read"}
      </Button>
    </form>
  );
}

export function MarkAllAsReadButton() {
  const [, formAction, isPending] = useActionState(markAllAsReadAction, {});

  return (
    <form action={formAction}>
      <Button type="submit" variant="outline" size="sm" className="text-xs font-bold" disabled={isPending}>
        {isPending ? "Marking..." : "Mark all as read"}
      </Button>
    </form>
  );
}
