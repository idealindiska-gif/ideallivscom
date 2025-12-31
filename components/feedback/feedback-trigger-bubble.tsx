'use client';

import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FeedbackTriggerBubbleProps {
  onClick: () => void;
  isVisible: boolean;
}

export function FeedbackTriggerBubble({ onClick, isVisible }: FeedbackTriggerBubbleProps) {
  if (!isVisible) return null;

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        'fixed bottom-6 left-6 z-[9997]',
        'bg-gradient-to-r from-primary to-primary/80',
        'text-white rounded-full p-4 shadow-lg',
        'hover:shadow-xl transition-all duration-300',
        'flex items-center gap-2',
        'group cursor-pointer'
      )}
      aria-label="Share feedback"
    >
      <MessageCircle className="h-6 w-6" />
      <motion.span
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: 'auto', opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-sm font-medium whitespace-nowrap overflow-hidden"
      >
        Share Feedback
      </motion.span>
    </motion.button>
  );
}
