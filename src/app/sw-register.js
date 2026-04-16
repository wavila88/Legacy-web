'use client';

import { useEffect } from 'react';

/**
 * Registers the service worker once the app mounts.
 * Imported in layout.js so it runs on every page.
 */
export default function SwRegister() {
  useEffect(() => {
    // Skip service worker in development to avoid caching stale assets
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .catch((err) => console.warn('[SW] Registration failed:', err));
    }
  }, []);

  return null;
}
