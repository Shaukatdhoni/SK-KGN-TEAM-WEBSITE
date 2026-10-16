const CACHE_NAME = "sk-kgn-team-v1";

self.addEventListener("install", event => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response(
        "You are offline. Please check your internet connection.",
        {
          headers: {
            "Content-Type": "text/plain; charset=utf-8"
          }
        }
      );
    })
  );
});