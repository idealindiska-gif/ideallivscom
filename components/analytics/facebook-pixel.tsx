/**
 * Facebook Pixel Component
 * Integrates Meta/Facebook Pixel tracking with deferred loading
 */

'use client';

import Image from 'next/image';
import { useEffect } from 'react';

export function FacebookPixel() {
  const PIXEL_ID = '651966044655390';

  useEffect(() => {
    // Defer Facebook Pixel loading until after page is interactive
    const loadFacebookPixel = () => {
      if (typeof window !== 'undefined' && !(window as any).fbq) {
        const f = window as any;
        const b = document;
        const e = 'script';
        const v = 'https://connect.facebook.net/en_US/fbevents.js';
        let n: any, t: any, s: any;

        if (f.fbq) return;
        n = f.fbq = function (...args: any[]) {
          n.callMethod ? n.callMethod.apply(n, args) : n.queue.push(args);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = true;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = true;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);

        f.fbq('init', PIXEL_ID);
        f.fbq('track', 'PageView');
      }
    };

    // Use requestIdleCallback for better performance, fallback to setTimeout
    if ('requestIdleCallback' in window) {
      const idleCallback = requestIdleCallback(loadFacebookPixel, { timeout: 3000 });
      return () => cancelIdleCallback(idleCallback);
    } else {
      const timer = setTimeout(loadFacebookPixel, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <noscript>
      <Image
        height={1}
        width={1}
        style={{ display: 'none' }}
        src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  );
}
