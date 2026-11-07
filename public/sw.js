// Aurora Ledger Service Worker v1
// Hand-rolled — Next.js 16 uses Turbopack which is incompatible with Serwist/next-pwa.
//
// CACHING STRATEGY RATIONALE:
// • Static assets (_next/static/, icons, fonts) → stale-while-revalidate: fast loads, background refresh
// • Navigation requests → network-first with /offline fallback: always serve fresh HTML
// • Safe GET API routes (/api/reports, /api/transactions, etc.) → network-first (4s timeout) → cache fallback
// • /api/auth/* and all mutations (POST/PUT/PATCH/DELETE) → NEVER cached, pass-through only
// • Caches cleared on sign-out via CLEAR_CACHES message
// • New SW version → postMessage SW_UPDATED to all clients → app shows "Update" toast

const CACHE_VERSION = "v1";
const STATIC_CACHE = `aurora-static-${CACHE_VERSION}`;
const API_CACHE = `aurora-api-${CACHE_VERSION}`;
const ALL_CACHES = [STATIC_CACHE, API_CACHE];

// Routes that must NEVER be intercepted (auth, mutations)
const BYPASS_PATTERNS = [
  "/api/auth/",
  "/api/user/delete",
  "/api/user/password",
];

const isBypass = (url) => {
  const path = new URL(url).pathname;
  return BYPASS_PATTERNS.some((p) => path.startsWith(p));
};

const isMutation = (request) =>
  ["POST", "PUT", "PATCH", "DELETE"].includes(request.method);

const isStaticAsset = (url) => {
  const path = new URL(url).pathname;
  return (
    path.startsWith("/_next/static/") ||
    path.startsWith("/icons/") ||
    path.startsWith("/screenshots/") ||
    /\.(png|jpg|jpeg|webp|svg|ico|woff2?|ttf|otf)$/.test(path)
  );
};

const isSafeApiGet = (request) => {
  const path = new URL(request.url).pathname;
  return (
    request.method === "GET" &&
    path.startsWith("/api/") &&
    !isBypass(request.url)
  );
};

// Install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) =>
        cache.addAll(["/offline"]).catch(() => {})
      )
      .then(() => self.skipWaiting())
  );
});

// Activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !ALL_CACHES.includes(k))
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
      .then(() =>
        self.clients
          .matchAll({ includeUncontrolled: true, type: "window" })
          .then((clients) =>
            clients.forEach((c) => c.postMessage({ type: "SW_UPDATED" }))
          )
      )
  );
});

// Fetch
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;
  if (isMutation(request) || isBypass(request.url)) return;

  // Static assets — stale-while-revalidate
  if (isStaticAsset(request.url)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const fetchPromise = fetch(request)
          .then((res) => {
            if (res.ok && res.status < 400) cache.put(request, res.clone());
            return res;
          })
          .catch(() => null);
        return cached || fetchPromise || new Response("", { status: 503 });
      })
    );
    return;
  }

  // Safe API GETs — network-first (4s) then cache
  if (isSafeApiGet(request)) {
    event.respondWith(
      caches.open(API_CACHE).then(async (cache) => {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 4000);
        try {
          const res = await fetch(request, { signal: controller.signal });
          clearTimeout(tid);
          if (res.ok) cache.put(request, res.clone());
          return res;
        } catch {
          clearTimeout(tid);
          const cached = await cache.match(request);
          if (cached) return cached;
          return new Response(
            JSON.stringify({ error: "Offline", offline: true }),
            { status: 503, headers: { "Content-Type": "application/json" } }
          );
        }
      })
    );
    return;
  }

  // Navigation — network-first → /offline fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        const offline = await caches.match("/offline");
        return offline || new Response("<h1>Offline</h1>", {
          headers: { "Content-Type": "text/html" },
        });
      })
    );
    return;
  }

  // Everything else — network with cache fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// Messages
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
  if (event.data?.type === "CLEAR_CACHES") {
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
  }
});
