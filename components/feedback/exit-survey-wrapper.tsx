'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useExitIntent } from '@/hooks/use-exit-intent';
import { ExitSurvey } from './exit-survey';
import { FeedbackTriggerBubble } from './feedback-trigger-bubble';

// Pages where we should NOT show the exit survey
const EXCLUDED_PATHS = [
  '/order-received',
  '/thank-you',
  '/order-confirmation',
  '/checkout/order-received',
];

export function ExitSurveyWrapper() {
  const pathname = usePathname();
  const [shouldShow, setShouldShow] = useState(false);
  const [manualTrigger, setManualTrigger] = useState(false);

  // Check if current page is excluded
  const isExcludedPage = EXCLUDED_PATHS.some((path) =>
    pathname?.includes(path)
  );

  // Check if survey was already submitted
  const [wasSubmitted, setWasSubmitted] = useState(false);

  useEffect(() => {
    const submitted = localStorage.getItem('exit_survey_shown_submitted');
    setWasSubmitted(!!submitted);
  }, []);

  // Enable exit intent only if not on excluded pages
  const { showExitIntent, dismiss } = useExitIntent({
    enabled: !isExcludedPage && shouldShow,
    threshold: 50,
    delayMs: 500,
    cookieName: 'exit_survey_shown',
    cookieExpireDays: 7,
  });

  useEffect(() => {
    if (isExcludedPage) return;

    // Enable after user interaction
    const enableAfterInteraction = () => {
      setShouldShow(true);
    };

    // Enable after 15 seconds OR after first user interaction
    const timer = setTimeout(() => {
      setShouldShow(true);
    }, 15000); // 15 seconds

    // Enable on first click or scroll
    document.addEventListener('click', enableAfterInteraction, { once: true });
    document.addEventListener('scroll', enableAfterInteraction, { once: true });

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', enableAfterInteraction);
      document.removeEventListener('scroll', enableAfterInteraction);
    };
  }, [isExcludedPage]);

  // Don't render on excluded pages
  if (isExcludedPage) {
    return null;
  }

  const handleManualTrigger = () => {
    setManualTrigger(true);
  };

  const handleClose = () => {
    setManualTrigger(false);
    dismiss();
  };

  const shouldShowSurvey = showExitIntent || manualTrigger;

  return (
    <>
      <FeedbackTriggerBubble
        onClick={handleManualTrigger}
        isVisible={!wasSubmitted && !shouldShowSurvey}
      />
      <ExitSurvey show={shouldShowSurvey} onClose={handleClose} />
    </>
  );
}
