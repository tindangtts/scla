"use client";

import { useEffect, useState } from "react";

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
      // Already granted - silently register SW
      registerAndSubscribe().catch(console.error);
      return;
    }

    if (Notification.permission === "default") {
      // Check if user dismissed before
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
    <div className="mx-4 mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3 text-sm">
      <div className="flex-1">
        <p className="text-blue-900">
          Enable push notifications to stay updated on your tickets and bills.
        </p>
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={handleEnable}
          className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700"
        >
          Enable
        </button>
        <button
          onClick={handleDismiss}
          className="px-3 py-1 bg-white border border-gray-300 rounded text-xs text-gray-600 hover:bg-gray-50"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
