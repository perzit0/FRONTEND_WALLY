/* Service worker de la app WALLY.
   Hace dos cosas:
   1. Cachea el "cascarón" de la app para que abra rápido / offline.
   2. Recibe las alarmas web push del backend (variación brusca, límites)
      y las muestra como notificación con vibración, incluso con la app
      cerrada. */

const PRECACHE = self.__WB_MANIFEST || [];
const CACHE = "wally-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        cache.addAll(PRECACHE.map((entrada) => entrada.url || entrada))
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((claves) =>
        Promise.all(claves.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return; // API y mapas: directo a la red

  // Navegación: red primero (para no servir una app vieja), cache si no hay internet
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/index.html"))
    );
    return;
  }

  // Assets: cache primero (tienen hash en el nombre), red si no está
  event.respondWith(
    caches.match(event.request).then((res) => res || fetch(event.request))
  );
});

// ---------- Alarmas push ----------

self.addEventListener("push", (event) => {
  let datos = {};
  try {
    datos = event.data ? event.data.json() : {};
  } catch {
    datos = { body: event.data && event.data.text() };
  }

  const titulo = datos.title || "🚨 Alarma WALLY";
  const opciones = {
    body: datos.body || "Revisa los valores de los sensores.",
    icon: "/pwa-192.png",
    badge: "/pwa-192.png",
    tag: datos.tag || "wally-alarma",
    renotify: true, // vuelve a sonar/vibrar aunque reemplace a la anterior
    requireInteraction: true, // se queda en pantalla hasta que la toques
    vibrate: [600, 200, 600, 200, 600, 200, 600],
    data: { url: "/" },
  };

  event.waitUntil(self.registration.showNotification(titulo, opciones));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((ventanas) => {
      for (const v of ventanas) {
        if ("focus" in v) return v.focus();
      }
      return self.clients.openWindow(event.notification.data?.url || "/");
    })
  );
});
