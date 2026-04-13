"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function NotificationBell() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;

    async function fetchCount() {
      try {
        const res = await fetch("/api/notifications/unread-count");
        if (res.ok) {
          const data = await res.json();
          if (active) setCount(data.count ?? 0);
        }
      } catch {
        // Silently ignore fetch errors
      }
    }

    fetchCount();
    const interval = setInterval(fetchCount, 30_000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <Link
      href="/notifications"
      className="relative inline-flex items-center"
      aria-label={count > 0 ? `Notifications, ${count > 9 ? "9+" : count} unread` : "Notifications"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5 text-white"
        aria-hidden="true"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {count > 0 && (
        <span
          role="status"
          aria-live="polite"
          className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white"
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
