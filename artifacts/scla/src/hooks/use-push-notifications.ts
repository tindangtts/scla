import { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export interface UsePushNotificationsResult {
  isSupported: boolean;
  permission: NotificationPermission | "loading";
  isSubscribed: boolean;
  subscribe: (token: string) => Promise<void>;
  unsubscribe: (token: string) => Promise<void>;
}

export function usePushNotifications(): UsePushNotificationsResult {
  const isSupported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window;

  const [permission, setPermission] = useState<NotificationPermission | "loading">("loading");
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!isSupported) return;
    setPermission(Notification.permission);

    // Register service worker
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        // Check if already subscribed
        return reg.pushManager.getSubscription();
      })
      .then((sub) => {
        setIsSubscribed(!!sub);
      })
      .catch((err) => {
        console.error("Service worker registration failed:", err);
      });
  }, [isSupported]);

  async function subscribe(token: string): Promise<void> {
    if (!isSupported) return;

    // Request permission
    const perm = await Notification.requestPermission();
    setPermission(perm);
    if (perm !== "granted") return;

    // Fetch VAPID public key from backend
    const keyRes = await fetch(`${API_BASE}/push/vapid-public-key`);
    if (!keyRes.ok) throw new Error("Could not fetch VAPID public key");
    const { publicKey } = await keyRes.json();

    const reg = await navigator.serviceWorker.ready;
    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
    });

    const subJson = subscription.toJSON();
    await fetch(`${API_BASE}/push/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        endpoint: subJson.endpoint,
        keys: { p256dh: subJson.keys?.p256dh, auth: subJson.keys?.auth },
      }),
    });

    setIsSubscribed(true);
  }

  async function unsubscribe(token: string): Promise<void> {
    if (!isSupported) return;

    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (!sub) return;

    await fetch(`${API_BASE}/push/unsubscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ endpoint: sub.endpoint }),
    });

    await sub.unsubscribe();
    setIsSubscribed(false);
  }

  return { isSupported, permission, isSubscribed, subscribe, unsubscribe };
}
