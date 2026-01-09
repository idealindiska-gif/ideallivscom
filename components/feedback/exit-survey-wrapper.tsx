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

  // Disable exit intent - only manual trigger allowed
  const { showExitIntent, dismiss } = useExitIntent({
    enabled: false, // DISABLED - only manual trigger
    threshold: 50,
    delayMs: 500,
    cookieName: 'exit_survey_shown',
    cookieExpireDays: 7,
  });

  // DISABLED: Auto-enable functionality
  // Survey now only triggers via manual button click
  useEffect(() => {
    // No auto-enable
  }, [isExcludedPage]);

  // Listen for manual trigger from sidebar button
  useEffect(() => {
    const handleOpenFeedback = () => {
      setManualTrigger(true);
    };

    window.addEventListener('openFeedback', handleOpenFeedback);
    return () => {
      window.removeEventListener('openFeedback', handleOpenFeedback);
    };
  }, []);

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
      {/* Bubble is now disabled - using sidebar button instead */}
      <FeedbackTriggerBubble
        onClick={handleManualTrigger}
        isVisible={false}
      />
      <ExitSurvey show={shouldShowSurvey} onClose={handleClose} />
    </>
  );
}
