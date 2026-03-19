const CACHE_NAME = 'mis-gastos-v1'
const STATIC_ASSETS = ['/', '/login']

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', event => {
  // API calls: network only, no cache
  if (event.request.url.includes('/api/')) {
    return
  }
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  )
})
