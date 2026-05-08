'use client';

import { motion, type Variants } from 'framer-motion';
import type { ChatTheme } from '@/types';

interface TypingIndicatorProps {
  theme: ChatTheme;
  sender?: string;
  senderColor?: string;
}

// Dot animation is done inline (not via variants) to avoid Framer Motion
// type-narrowing issues with keyframe arrays + ease strings.

// Container spring — slides in from below and scales up subtly.
const containerVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
    scale: 0.92,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      damping: 18,
      stiffness: 260,
      mass: 0.7,
    },
  },
  exit: {
    opacity: 0,
    y: 6,
    scale: 0.94,
    transition: { duration: 0.18, ease: 'easeIn' as const },
  },
};

export function TypingIndicator({ theme, sender, senderColor }: TypingIndicatorProps) {
  const avatarColor = senderColor ?? theme.vars.typingDot;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex items-end gap-2 px-3 mb-0.5"
    >
      {/* Avatar */}
      <div className="shrink-0 w-7 h-7">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
          style={{ backgroundColor: avatarColor }}
        >
          {sender ? sender[0].toUpperCase() : '?'}
        </div>
      </div>

      {/* Bubble */}
      <div
        className="flex items-center gap-1.5 shadow-sm"
        style={{
          backgroundColor: theme.vars.theirBubbleBg,
          borderRadius: theme.config.theirBubbleRadius,
          padding: '10px 14px',
          minWidth: 52,
        }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="rounded-full"
            style={{
              width: 8,
              height: 8,
              backgroundColor: theme.vars.typingDot,
            }}
            animate={{
              y: [0, -6, 0],
              opacity: [0.45, 1, 0.45],
              transition: {
                duration: 0.75,
                repeat: Infinity,
                ease: 'easeInOut' as const,
                delay: i * 0.18,
              },
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
