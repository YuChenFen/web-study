const CACHE_NAME = 'my-cache-v1';

self.addEventListener('install', async function (event) {
    let cache = await caches.open(CACHE_NAME);
    cache.addAll([
        '/',
        "/manifest.json",
        "/images/icon-144.png"
    ]);
    await self.skipWaiting();
});

self.addEventListener('activate', async function (event) {
    let keys = await caches.keys();
    for (let key of keys) {
        if (key !== CACHE_NAME) {
            await caches.delete(key);
        }
    }
    await self.clients.claim();
});

self.addEventListener('fetch', async function (event) {
    const req = event.request;
    event.respondWith(networkFirst(req));
});

async function networkFirst(req) {
    try {
        console.log("来自网络：", req);
        let fresh = await fetch(req);
        return fresh;
    } catch (err) {
        console.log("来自缓存：", req);
        let cache = await caches.open(CACHE_NAME);
        return await cache.match(req);
    }
}
