self.addEventListener('push', function(event) {
  if (event.data) {
    let payload;
    try {
      payload = event.data.json();
    } catch (e) {
      payload = { title: 'New Notification', message: event.data.text() };
    }
    
    const options = {
      body: payload.message,
      icon: '/logo.png', // Ensure this exists in public/
      badge: '/logo.png',
      vibrate: [200, 100, 200, 100, 200, 100, 200],
      data: {
        url: payload.url || '/'
      }
    };

    event.waitUntil(
      self.registration.showNotification(payload.title, options)
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Minimal fetch listener for PWA compliance (PWABuilder requirement)
self.addEventListener('fetch', function(event) {
  // We can add offline caching logic here later if needed
  // For now, just pass the request through to satisfy PWA install requirements
  event.respondWith(fetch(event.request));
});
