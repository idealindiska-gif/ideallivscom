'use client';

import { useEffect, useState } from 'react';

interface UseExitIntentOptions {
  enabled?: boolean;
  threshold?: number; // Mouse Y position threshold for exit detection
  delayMs?: number; // Delay before showing (ms)
  cookieName?: string;
  cookieExpireDays?: number;
}

export function useExitIntent({
  enabled = true,
  threshold = 50,
  delayMs = 0,
  cookieName = 'exit_survey_shown',
  cookieExpireDays = 7,
}: UseExitIntentOptions = {}) {
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    // Check if survey was already submitted (not just shown)
    const wasSubmitted = localStorage.getItem(`${cookieName}_submitted`);
    if (wasSubmitted) {
      setHasBeenShown(true);
      return;
    }

    let timeoutId: NodeJS.Timeout;

    const handleMouseLeave = (e: MouseEvent) => {
      // Detect mouse leaving from top of viewport (closing tab/window)
      if (e.clientY <= threshold && !hasBeenShown) {
        timeoutId = setTimeout(() => {
          setShowExitIntent(true);
          setHasBeenShown(true);
        }, delayMs);
      }
    };

    // Touch support for mobile devices
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        // Store initial touch position
        (window as any).__touchStartY = touch.clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch || hasBeenShown) return;

      const startY = (window as any).__touchStartY || 0;
      const currentY = touch.clientY;

      // Detect upward swipe from bottom (mobile exit intent)
      if (startY > window.innerHeight - 100 && currentY < startY - 50) {
        timeoutId = setTimeout(() => {
          setShowExitIntent(true);
          setHasBeenShown(true);
        }, delayMs);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [enabled, threshold, delayMs, hasBeenShown, cookieName, cookieExpireDays]);

  const dismiss = () => {
    setShowExitIntent(false);
  };

  return { showExitIntent, dismiss, hasBeenShown };
}
