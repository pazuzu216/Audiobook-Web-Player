// This is the service worker for the audio player web app, used for installing the app on a computer for offline use.

self.addEventListener('install', event => {                 // This event when the app is installed by the user.
    event.waitUntil(                                        // This function waits for the installation to complete before continuing.
        caches.open('audioplayer-cache').then(cache => {    // Open a cache named 'audioplayer-cache'. To store the files needed for offline use.
            return cache.addAll([
                './',
                './index.html',
                './styles.css',
                './manifest.json',
                './web-app-manifest-192x192.png',
                './web-app-manifest-512x512.png'
            ]);
        })
    );
});

// This event is fired when the service worker is activated. It is used to clean up old caches.
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});