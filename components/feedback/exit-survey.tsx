'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { X, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ExitSurveyProps {
  show: boolean;
  onClose: () => void;
}

const FEEDBACK_OPTIONS = [
  { id: 'high_prices', label: 'Prices are too high' },
  { id: 'high_shipping', label: 'Shipping cost is too high' },
  { id: 'website_issues', label: 'Website not working properly' },
  { id: 'payment_issues', label: 'Payment options limited' },
  { id: 'slow_delivery', label: 'Delivery time too long' },
  { id: 'just_browsing', label: 'Just browsing' },
  { id: 'better_price', label: 'Found better price elsewhere' },
  { id: 'unclear_info', label: 'Product info unclear' },
  { id: 'complicated_checkout', label: 'Checkout too complicated' },
];

export function ExitSurvey({ show, onClose }: ExitSurveyProps) {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [otherFeedback, setOtherFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const toggleReason = (reasonId: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reasonId)
        ? prev.filter((id) => id !== reasonId)
        : [...prev, reasonId]
    );
  };

  const handleSubmit = async () => {
    if (selectedReasons.length === 0 && !otherFeedback.trim()) {
      // Just close if nothing selected
      onClose();
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/feedback/exit-survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reasons: selectedReasons,
          otherFeedback: otherFeedback.trim(),
          url: window.location.href,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        // Mark as submitted in localStorage so it won't show again
        localStorage.setItem('exit_survey_shown_submitted', 'true');
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        console.error('Failed to submit feedback');
        onClose();
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[9998]"
            onClick={onClose}
            style={{ pointerEvents: 'auto' }}
          />

          {/* Survey Card - Bottom Right */}
          <motion.div
            initial={{ opacity: 0, y: 20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 20, x: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-[9999] w-full max-w-md"
            style={{ pointerEvents: 'auto' }}
          >
            <Card className="shadow-2xl border-2 bg-white dark:bg-gray-900">
              {isSubmitted ? (
                <CardContent className="pt-6 pb-6 text-center">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                    <Send className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Thank you!</h3>
                  <p className="text-sm text-muted-foreground">
                    Your feedback helps us improve
                  </p>
                </CardContent>
              ) : (
                <>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">Quick Question</CardTitle>
                        <CardDescription className="text-sm mt-1">
                          What stopped you from ordering today?
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 -mt-1 -mr-2"
                        onClick={onClose}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Quick Select Options */}
                    <div className="flex flex-wrap gap-2">
                      {FEEDBACK_OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => toggleReason(option.id)}
                          className={cn(
                            'px-3 py-1.5 text-xs rounded-full border transition-all',
                            selectedReasons.includes(option.id)
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background hover:bg-muted border-border'
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>

                    {/* Optional Text Box */}
                    <Textarea
                      placeholder="Any other details? (optional)"
                      value={otherFeedback}
                      onChange={(e) => setOtherFeedback(e.target.value)}
                      className="min-h-[60px] text-sm resize-none"
                      maxLength={500}
                    />

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-1"
                        size="sm"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-3 w-3 mr-2" />
                            Send Feedback
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={onClose}
                        size="sm"
                        disabled={isSubmitting}
                      >
                        Skip
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground text-center">
                      We use this to improve your shopping experience
                    </p>
                  </CardContent>
                </>
              )}
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
