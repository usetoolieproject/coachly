/// <reference types="vite/client" />
/// <reference lib="webworker" />

// Add missing Service Worker event types
// interface SyncEvent extends ExtendableEvent { tag: string }
interface InstallEvent extends ExtendableEvent {}
interface ActivateEvent extends ExtendableEvent {}

import { clientsClaim } from 'workbox-core'
import { ExpirationPlugin } from 'workbox-expiration'
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst, CacheFirst, StaleWhileRevalidate, NetworkOnly } from 'workbox-strategies'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'

declare const self: ServiceWorkerGlobalScope

// Ensure the service worker takes control immediately
clientsClaim()

// Precache and route static assets
precacheAndRoute(self.__WB_MANIFEST)

// Register navigation routes
const fileExtensionRegexp = new RegExp('/[^/?]+\.[^/]+$')
registerRoute(
  ({ request, url }: { request: Request; url: URL }) => {
    if (request.mode !== 'navigate') {
      return false
    }
    if (url.pathname.startsWith('/_')) {
      return false
    }
    if (url.pathname.match(fileExtensionRegexp)) {
      return false
    }
    return true
  },
  createHandlerBoundToURL('/index.html')
)

// Cache static assets (JS, CSS, images) with CacheFirst strategy
registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'style',
  new CacheFirst({
    cacheName: 'static-resources',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        purgeOnQuotaError: true
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200]
      })
    ]
  })
)

// Cache images with CacheFirst strategy
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 24 * 60 * 60, // 60 days
        purgeOnQuotaError: true
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200]
      })
    ]
  })
)

// Cache API responses with NetworkFirst strategy (prioritize fresh data)
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 5 * 60, // 5 minutes default
        purgeOnQuotaError: true
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200]
      })
    ],
    networkTimeoutSeconds: 3,
    matchOptions: {
      ignoreSearch: true
    }
  })
)

// Special caching for dashboard/analytics endpoints (5 min cache)
registerRoute(
  ({ url }) => url.pathname.includes('/dashboard') || url.pathname.includes('/analytics'),
  new NetworkFirst({
    cacheName: 'dashboard-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60, // 5 minutes
        purgeOnQuotaError: true
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200]
      })
    ],
    networkTimeoutSeconds: 3
  })
)

// Cache course content with longer cache (1 hour) and background updates
registerRoute(
  ({ url }) => url.pathname.includes('/course') || url.pathname.includes('/lesson'),
  new StaleWhileRevalidate({
    cacheName: 'course-content',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60, // 1 hour
        purgeOnQuotaError: true
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200]
      })
    ]
  })
)

// Cache user profile data (10 minutes)
registerRoute(
  ({ url }) => url.pathname.includes('/profile'),
  new NetworkFirst({
    cacheName: 'profile-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 10 * 60, // 10 minutes
        purgeOnQuotaError: true
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200]
      })
    ],
    networkTimeoutSeconds: 3
  })
)

// Auth endpoints should NEVER be cached (NetworkOnly)
registerRoute(
  ({ url }) => url.pathname.includes('/auth') || url.pathname.includes('/login') || url.pathname.includes('/logout'),
  new NetworkOnly()
)

// Skip waiting on activation to ensure immediate control
self.addEventListener('activate', (_event: ActivateEvent) => {
  // [SW] Service Worker activating...
  _event.waitUntil(self.clients.claim())
})

// Background sync queue for offline mutations
const backgroundSyncQueue = new Map<string, { url: string; [key: string]: any }>()

self.addEventListener('sync', ((event: any) => {
  if (event.tag && event.tag.startsWith('sync-')) {
    event.waitUntil(syncOfflineRequests(event.tag));
  }
}) as EventListener);

async function syncOfflineRequests(tag: string) {
  try {
    const requestData = backgroundSyncQueue.get(tag)
    if (!requestData) {
      return
    }
    const response = await fetch(requestData.url as RequestInfo, requestData as RequestInit)
    if (response.ok) {
      // Notify all clients that sync succeeded
      const clients = await self.clients.matchAll({ includeUncontrolled: true })
      clients.forEach(client => {
        client.postMessage({
          type: 'SYNC_SUCCESS',
          tag
        })
      })
      backgroundSyncQueue.delete(tag)
    } else {
      throw new Error(`Sync failed: ${response.status}`)
    }
  } catch (error) {
    // Background sync failed
    // Notify clients of failure
    const clients = await self.clients.matchAll({ includeUncontrolled: true })
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_FAILED',
        tag,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    })
  }
}

// Handle fetch events for offline requests
self.addEventListener('fetch', (event: FetchEvent) => {
  // Only handle POST, PUT, DELETE requests
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(event.request.method)) {
    return
  }
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        // Request failed, queue it for background sync
        const tag = `sync-${Date.now()}`
        backgroundSyncQueue.set(tag, {
          url: event.request.url,
          method: event.request.method,
          headers: Object.fromEntries(event.request.headers.entries()),
          body: event.request.clone().body,
          credentials: event.request.credentials,
          cache: event.request.cache,
          mode: event.request.mode,
          redirect: event.request.redirect,
          referrer: event.request.referrer,
          signal: event.request.signal
        })
        // Register sync for when connection is restored
        if ('sync' in (self.registration as any)) {
          (self.registration as any).sync.register(tag).catch(() => {
            // Background sync not supported
          })
        }
        // Return a response indicating the request is queued
        return new Response(
          JSON.stringify({ 
            queued: true, 
            message: 'Request queued for sync when online',
            tag 
          }),
          {
            status: 202,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      })
  )
})

// Handle messages from clients
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// Log service worker lifecycle
self.addEventListener('install', (_event: InstallEvent) => {
  // [SW] Service Worker installing...
  self.skipWaiting()
})

