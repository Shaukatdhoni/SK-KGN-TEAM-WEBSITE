const CACHE_NAME = "sk-kgn-team-v5";

const OFFLINE_PAGE = "/offline.html";

const CORE_FILES = [
    "/offline.html",
    "/shaukat.jpg"
];

// INSTALL SERVICE WORKER
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(CORE_FILES))
            .then(() => self.skipWaiting())
    );
});


// ACTIVATE SERVICE WORKER
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys()
            .then(keys => {
                return Promise.all(
                    keys
                        .filter(key =>
                            key.startsWith("sk-kgn-team-") &&
                            key !== CACHE_NAME
                        )
                        .map(key => caches.delete(key))
                );
            })
            .then(() => self.clients.claim())
    );
});


// HANDLE NETWORK REQUESTS
self.addEventListener("fetch", event => {

    const request = event.request;

    // Only GET requests
    if (request.method !== "GET") return;

    const url = new URL(request.url);

    // Ignore external websites
    if (url.origin !== self.location.origin) return;


    // PAGE NAVIGATION
    if (request.mode === "navigate") {

        event.respondWith(
            fetch(request)
                .then(response => {

                    if (response.ok) {
                        const copy = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(request, copy);
                            });
                    }

                    return response;
                })

                .catch(async () => {

                    // Previously cached page
                    const cachedPage = await caches.match(request);

                    if (cachedPage) {
                        return cachedPage;
                    }

                    // Show custom offline page
                    const offlinePage =
                        await caches.match(OFFLINE_PAGE);

                    if (offlinePage) {
                        return offlinePage;
                    }

                    // Final fallback
                    return new Response(
                        "आप अभी Offline हैं। इंटरनेट कनेक्शन चेक करें।",
                        {
                            status: 503,
                            headers: {
                                "Content-Type": "text/plain; charset=utf-8"
                            }
                        }
                    );
                })
        );

        return;
    }


    // CACHE CSS, JAVASCRIPT, IMAGES AND FONTS
    if (
        ["style", "script", "image", "font"].includes(
            request.destination
        )
    ) {

        event.respondWith(
            caches.match(request)
                .then(cached => {

                    if (cached) {
                        return cached;
                    }

                    return fetch(request)
                        .then(response => {

                            if (response.ok) {
                                const copy = response.clone();

                                caches.open(CACHE_NAME)
                                    .then(cache => {
                                        cache.put(request, copy);
                                    });
                            }

                            return response;
                        });
                })
        );
    }

});