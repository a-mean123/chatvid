'use client';

import { motion, AnimatePresence, type Variants } from 'framer-motion';
import type { ParsedMessage, ChatTheme, Character } from '@/types';
import { getInitials, getAvatarColor } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { TickState } from './ChatPreview';

interface ChatBubbleProps {
  message: ParsedMessage;
  theme: ChatTheme;
  character?: Character;
  tickState?: TickState;
  timestamp: string;
}

// Me bubbles slide in from the right; their bubbles from the left.
const myBubbleVariants: Variants = {
  hidden:  { opacity: 0, y: 8, x: 12, scale: 0.94 },
  visible: { opacity: 1, y: 0, x: 0,  scale: 1,
    transition: { type: 'spring', damping: 22, stiffness: 280, mass: 0.75 } },
};

const theirBubbleVariants: Variants = {
  hidden:  { opacity: 0, y: 8, x: -12, scale: 0.94 },
  visible: { opacity: 1, y: 0, x: 0,   scale: 1,
    transition: { type: 'spring', damping: 22, stiffness: 280, mass: 0.75 } },
};

const systemVariants: Variants = {
  hidden:  { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.25, ease: 'easeOut' } },
};

// ── Tick icons ────────────────────────────────────────────────────────────────

function SingleTick({ color }: { color: string }) {
  return (
    <svg width="14" height="10" viewBox="0 0 14 10" fill="none" className="inline-block shrink-0">
      <path d="M1 5L5 9L13 1" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DoubleTick({ color, read }: { color: string; read: boolean }) {
  return (
    <svg width="18" height="11" viewBox="0 0 18 11" fill="none" className="inline-block shrink-0">
      <path d="M1 5.5L5 9.5L13 1.5" stroke={read ? color : 'currentColor'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity={read ? 1 : 0.45} />
      <path d="M5 5.5L9 9.5L17 1.5" stroke={read ? color : 'currentColor'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity={read ? 1 : 0.45} />
    </svg>
  );
}

function CircleTick({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="inline-block shrink-0">
      <circle cx="7" cy="7" r="6" stroke={color} strokeWidth="1.5" opacity="0.6" />
      <path d="M4 7L6.5 9.5L10 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Tick({ tickState, theme }: { tickState: TickState; theme: ChatTheme }) {
  const style = theme.config.tickStyle;
  if (style === 'none') return null;
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={tickState}
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.7 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="inline-flex items-center"
        style={{ color: theme.vars.timestamp }}
      >
        {style === 'double-tick' && tickState === 'sent'      && <SingleTick color={theme.vars.timestamp} />}
        {style === 'double-tick' && tickState === 'delivered' && <DoubleTick color={theme.vars.timestamp} read={false} />}
        {style === 'double-tick' && tickState === 'read'      && <DoubleTick color={theme.vars.tick} read={true} />}
        {style === 'circle'     && tickState === 'sent'      && <SingleTick color={theme.vars.timestamp} />}
        {style === 'circle'     && (tickState === 'delivered' || tickState === 'read')
          && <CircleTick color={tickState === 'read' ? theme.vars.tick : theme.vars.timestamp} />}
      </motion.span>
    </AnimatePresence>
  );
}

// ── System message ────────────────────────────────────────────────────────────

function SystemBubble({ content, theme }: { content: string; theme: ChatTheme }) {
  return (
    <motion.div
      variants={systemVariants}
      initial="hidden"
      animate="visible"
      className="flex justify-center px-4 py-1"
    >
      <span
        className="text-[11px] px-3 py-1 rounded-full"
        style={{ backgroundColor: theme.vars.separator, color: theme.vars.timestamp }}
      >
        {content}
      </span>
    </motion.div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function ChatBubble({ message, theme, character, tickState, timestamp }: ChatBubbleProps) {
  if (message.type === 'system') {
    return <SystemBubble content={message.content} theme={theme} />;
  }

  const isMe        = message.isMe;
  const avatarColor = character?.color ?? getAvatarColor(message.sender);
  const initials    = getInitials(character?.name ?? message.sender);

  return (
    // Always flex-row. Me content gets ml-auto to push it to the right.
    // We intentionally do NOT put dir="" here — it would interfere with flex alignment.
    <motion.div
      variants={isMe ? myBubbleVariants : theirBubbleVariants}
      initial="hidden"
      animate="visible"
      className="flex items-end gap-2 px-3"
    >
      {/* Avatar — only for "them"; reserves width so bubbles stay aligned */}
      {!isMe && (
        <div className="shrink-0" style={{ width: 28 }}>
          {message.isLastInGroup && (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
              style={{ backgroundColor: avatarColor }}
            >
              {initials}
            </div>
          )}
        </div>
      )}

      {/* Bubble content — ml-auto on Me pushes it to the right edge */}
      <div className={cn('flex flex-col max-w-[75%]', isMe ? 'ml-auto items-end' : 'items-start')}>

        {/* Sender name — first bubble in group for "them" only */}
        {!isMe && message.isFirstInGroup && (
          <span className="text-[11px] font-semibold mb-0.5 px-1" style={{ color: avatarColor }}>
            {character?.name ?? message.sender}
          </span>
        )}

        {/* Image message */}
        {message.type === 'image' ? (
          <div
            className="overflow-hidden shadow-sm"
            style={{
              borderRadius: isMe ? theme.config.myBubbleRadius : theme.config.theirBubbleRadius,
              maxWidth: 220,
            }}
          >
            <img
              src={message.content}
              alt="shared image"
              className="w-full h-auto object-cover max-h-48"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/300x200/333/666?text=Image';
              }}
            />
            <div
              className="px-2 py-1 flex items-center justify-end gap-1"
              style={{ backgroundColor: isMe ? theme.vars.myBubbleBg : theme.vars.theirBubbleBg }}
            >
              <span className="text-[10px]" style={{ color: theme.vars.timestamp }}>{timestamp}</span>
              {isMe && tickState && <Tick tickState={tickState} theme={theme} />}
            </div>
          </div>
        ) : (
          /* Text message */
          <div
            className="shadow-sm"
            style={{
              backgroundColor: isMe ? theme.vars.myBubbleBg : theme.vars.theirBubbleBg,
              borderRadius: isMe ? theme.config.myBubbleRadius : theme.config.theirBubbleRadius,
              padding: theme.config.bubblePadding,
            }}
          >
            <p
              className="text-[15px] leading-relaxed whitespace-pre-wrap"
              dir={message.isRTL ? 'rtl' : 'ltr'}
              style={{
                color: isMe ? theme.vars.myBubbleText : theme.vars.theirBubbleText,
                fontFamily: theme.config.fontFamily,
                textAlign: message.isRTL ? 'right' : 'left',
                wordBreak: 'break-word',
                margin: 0,
              }}
            >
              {message.content}
            </p>

            <div className={cn('flex items-center gap-1 mt-0.5', isMe ? 'justify-end' : 'justify-start')}>
              <span className="text-[10px]" style={{ color: theme.vars.timestamp }}>
                {timestamp}
              </span>
              {isMe && tickState && <Tick tickState={tickState} theme={theme} />}
            </div>
          </div>
        )}

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className={cn('flex flex-wrap gap-1 mt-1', isMe ? 'justify-end' : 'justify-start')}>
            {message.reactions.map((emoji, i) => (
              <span
                key={i}
                className="inline-flex items-center px-1.5 py-0.5 rounded-full text-base leading-none shadow-sm"
                style={{
                  backgroundColor: theme.vars.inputBg,
                  border: `1px solid ${theme.vars.inputBorder}`,
                }}
              >
                {emoji}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
