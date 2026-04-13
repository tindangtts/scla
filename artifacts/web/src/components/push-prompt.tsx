"use client";

import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

async function registerAndSubscribe() {
  const registration = await navigator.serviceWorker.register("/sw.js");
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidKey) return;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidKey).buffer as ArrayBuffer,
  });

  const json = subscription.toJSON();
  await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      endpoint: json.endpoint,
      p256dh: json.keys?.p256dh,
      auth: json.keys?.auth,
    }),
  });
}

export default function PushPrompt() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect((): void | (() => void) => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;
    if (!("serviceWorker" in navigator)) return;

    if (Notification.permission === "granted") {
      registerAndSubscribe().catch(console.error);
      return;
    }

    if (Notification.permission === "default") {
      if (localStorage.getItem("push-prompt-dismissed")) return;
      const timer = setTimeout(() => setShowBanner(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  async function handleEnable() {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      await registerAndSubscribe().catch(console.error);
    }
    setShowBanner(false);
  }

  function handleDismiss() {
    localStorage.setItem("push-prompt-dismissed", "true");
    setShowBanner(false);
  }

  if (!showBanner) return null;

  return (
    <div className="mx-5 mt-3 rounded-2xl border border-primary/20 bg-primary/5 dark:bg-primary/10 p-3.5 flex items-center gap-3 shadow-sm">
      <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
        <Bell className="w-5 h-5" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground leading-tight">Stay informed</p>
        <p className="text-xs font-medium text-muted-foreground mt-0.5">
          Get alerts for ticket updates and bills.
        </p>
      </div>
      <div className="flex gap-1 shrink-0">
        <button
          onClick={handleEnable}
          className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Enable
        </button>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
