// Sri Telugu Classes — service worker
// Strategy: network-first for everything (site updates often), falling back
// to cache when offline. Core shell is pre-cached on install.

var CACHE = 'stc-v2';
var CORE = [
  './',
  './index.html',
  './login.html',
  './dashboard.html',
  './404.html',
  './styles.css',
  './main.js',
  './app.js',
  './students-data.js',
  './calendar-ics.js',
  './favicon.svg',
  './hero-scene.svg',
  './icon-192.png'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) { return c.addAll(CORE); }).then(function() {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k) { return k !== CACHE; }).map(function(k) {
        return caches.delete(k);
      }));
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  var req = e.request;
  if (req.method !== 'GET') return;                       // never touch form posts etc.
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;        // let fonts/APIs go direct

  e.respondWith(
    fetch(req).then(function(res) {
      if (res && res.ok) {
        var copy = res.clone();
        caches.open(CACHE).then(function(c) { c.put(req, copy); });
      }
      return res;
    }).catch(function() {
      return caches.match(req).then(function(hit) {
        if (hit) return hit;
        if (req.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});
