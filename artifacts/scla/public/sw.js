// Star City Living App — Service Worker
// Handles Web Push notifications for resident alerts.
// Also caches API GET responses for offline-first access.

const CACHE_NAME = "scla-v1";
const API_CACHE = "scla-api-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME && k !== API_CACHE).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Cache-first strategy for API GET routes
const API_CACHE_ROUTES = ["/api/tickets", "/api/bookings", "/api/announcements"];

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const isApiGet = event.request.method === "GET" &&
    API_CACHE_ROUTES.some(route => url.pathname.startsWith(route));

  if (!isApiGet) return; // let browser handle non-cached requests normally

  event.respondWith(
    caches.open(API_CACHE).then(async (cache) => {
      const cached = await cache.match(event.request);
      // Fetch from network and update cache regardless
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response.ok) {
            cache.put(event.request, response.clone());
          }
          return response;
        })
        .catch(() => cached); // network failed — return cached if available

      // Return cached immediately if available, else wait for network
      return cached ?? networkFetch;
    })
  );
});

// Push event: show a browser notification
self.addEventListener("push", (event) => {
  let data = { title: "Star City Living", body: "You have a new notification." };
  try {
    data = event.data?.json() ?? data;
  } catch {
    data.body = event.data?.text() ?? data.body;
  }

  const options = {
    body: data.body,
    icon: "/favicon.svg",
    badge: "/favicon.svg",
    data: { url: data.url ?? "/" },
    vibrate: [100, 50, 100],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click: navigate to the related URL
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((c) => c.url === url && "focus" in c);
      if (existing) return existing.focus();
      return self.clients.openWindow(url);
    })
  );
});

// Message handler: support SKIP_WAITING and CLEAR_API_CACHE from the React app
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (event.data?.type === "CLEAR_API_CACHE") {
    caches.delete(API_CACHE);
  }
});
