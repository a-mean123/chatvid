'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useChatStore } from '@/store/useChatStore';
import { getTheme } from '@/themes';
import { ChatBubble } from './ChatBubble';
import { TypingIndicator } from './TypingIndicator';
import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';
import { Keyboard } from './Keyboard';
import { getAvatarColor, formatConversationTime, stepTimeHHMM } from '@/lib/utils';
import { buildTimeline } from '@/lib/chatTimeline';
import { playSound } from '@/lib/audio';
import type { ParsedMessage } from '@/types';

const WA_PATTERN_LIGHT =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Crect width='60' height='60' fill='%23e5ddd5'/%3E%3Ccircle cx='30' cy='30' r='14' fill='%23d4cbc2' opacity='.35'/%3E%3C/svg%3E";
const WA_PATTERN_DARK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Crect width='60' height='60' fill='%230d1117'/%3E%3Ccircle cx='30' cy='30' r='12' fill='%23ffffff' opacity='.025'/%3E%3C/svg%3E";

export type TickState = 'sent' | 'delivered' | 'read';

interface ChatPreviewProps {
  width?: number;
  height?: number;
}

export function ChatPreview({ width = 340, height = 600 }: ChatPreviewProps) {
  const {
    messages, themeId, isDark,
    contactName, contactStatus,
    characters, animationSpeed,
    isPlaying, pause,
    soundEnabled,
    showMeTypingInInput,
    showKeyboard,
    conversationTime,
    timeFormat,
    autoStepTime,
    chatBgColor,
    chatBgImage,
  } = useChatStore();

  const theme = getTheme(themeId, isDark);

  // ── Animation state ──────────────────────────────────────────────────────
  const [visibleMessages, setVisibleMessages] = useState<ParsedMessage[]>([]);
  const [typingFor, setTypingFor]             = useState<string | null>(null);
  const [tickStates, setTickStates]           = useState<Record<string, TickState>>({});
  const [isMeTyping, setIsMeTyping]           = useState(false);
  const [meTypingText, setMeTypingText]       = useState('');

  // ── Refs ─────────────────────────────────────────────────────────────────
  const scrollRef         = useRef<HTMLDivElement>(null);
  const generationRef     = useRef(0);
  const soundRef          = useRef(soundEnabled);
  const isPlayingRef      = useRef(isPlaying);
  const showMeTypingRef   = useRef(showMeTypingInInput);
  const showKeyboardRef   = useRef(showKeyboard);
  const meTypingRafRef    = useRef<number | null>(null);

  useEffect(() => { soundRef.current       = soundEnabled;         }, [soundEnabled]);
  useEffect(() => { isPlayingRef.current   = isPlaying;            }, [isPlaying]);
  useEffect(() => { showMeTypingRef.current = showMeTypingInInput; }, [showMeTypingInInput]);
  useEffect(() => { showKeyboardRef.current = showKeyboard;        }, [showKeyboard]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight; // instant, no layout jank
  }, []);

  // Always scroll to bottom after any content change
  useEffect(() => {
    scrollToBottom();
  }, [visibleMessages, typingFor, isMeTyping, scrollToBottom]);

  function cancelMeTyping() {
    if (meTypingRafRef.current !== null) {
      cancelAnimationFrame(meTypingRafRef.current);
      meTypingRafRef.current = null;
    }
    setIsMeTyping(false);
    setMeTypingText('');
  }

  function schedule(gen: number, fn: () => void, delayMs: number) {
    setTimeout(() => {
      if (generationRef.current === gen) fn();
    }, Math.max(0, delayMs));
  }

  // ── Reset when script changes ────────────────────────────────────────────
  useEffect(() => {
    generationRef.current++;
    cancelMeTyping();
    setVisibleMessages([]);
    setTypingFor(null);
    setTickStates({});
    scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [messages]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Main playback engine ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isPlaying) {
      generationRef.current++;
      cancelMeTyping();
      setTypingFor(null);
      return;
    }

    const startIdx = visibleMessages.length;
    if (startIdx >= messages.length) { pause(); return; }

    const gen      = ++generationRef.current;
    const timeline = buildTimeline(messages, animationSpeed);
    const resumeCursor = startIdx > 0 ? timeline[startIdx - 1].sequenceEndMs : 0;

    for (let i = startIdx; i < messages.length; i++) {
      const msg   = messages[i];
      const entry = timeline[i];

      const relTyping  = entry.typingStartMs  - resumeCursor;
      const relShow    = entry.messageShowMs  - resumeCursor;
      const relDeliver = entry.deliveredMs    - resumeCursor;
      const relRead    = entry.readMs         - resumeCursor;

      if (msg.type !== 'system') {
        if (msg.isMe) {
          // ── Me: no typing dots; optionally drive input + keyboard ─────────
          const typingDuration = Math.max(100, relShow - relTyping);

          schedule(gen, () => {
            setIsMeTyping(true);

            // RAF animation for input text — skip for image messages (don't show the URL)
            if (showMeTypingRef.current && msg.type !== 'image') {
              const rafStart = Date.now();
              const fullText = msg.content;
              function rafTick() {
                if (generationRef.current !== gen) return;
                const progress = Math.min(1, (Date.now() - rafStart) / typingDuration);
                setMeTypingText(fullText.slice(0, Math.ceil(progress * fullText.length)));
                if (progress < 1) {
                  meTypingRafRef.current = requestAnimationFrame(rafTick);
                }
              }
              meTypingRafRef.current = requestAnimationFrame(rafTick);
            }

          }, relTyping);

        } else {
          // ── Them: show typing dots ────────────────────────────────────────
          schedule(gen, () => {
            setTypingFor(msg.sender);
          }, relTyping);
        }
      }

      // ── Message appears ─────────────────────────────────────────────────
      schedule(gen, () => {
        // Clean up Me typing state
        if (msg.isMe) {
          if (meTypingRafRef.current !== null) {
            cancelAnimationFrame(meTypingRafRef.current);
            meTypingRafRef.current = null;
          }
          setIsMeTyping(false);
          setMeTypingText('');
        }

        setTypingFor(null);
        setVisibleMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });

        if (msg.isMe) {
          setTickStates((prev) => ({ ...prev, [msg.id]: 'sent' }));
          if (soundRef.current) playSound('send');
        } else if (msg.type !== 'system') {
          if (soundRef.current) playSound('receive');
        }

      }, relShow);

      // ── Tick progression for Me ─────────────────────────────────────────
      if (msg.isMe) {
        schedule(gen, () => {
          setTickStates((prev) => ({ ...prev, [msg.id]: 'delivered' }));
        }, relDeliver);

        schedule(gen, () => {
          setTickStates((prev) => ({ ...prev, [msg.id]: 'read' }));
        }, relRead);
      }
    }

    const lastEntry = timeline[messages.length - 1];
    const endDelay  = lastEntry.messageShowMs - resumeCursor + 1800;
    schedule(gen, () => {
      cancelMeTyping();
      setTypingFor(null);
      pause();
    }, endDelay);
  }, [isPlaying]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Background style ─────────────────────────────────────────────────────
  const bgStyle: React.CSSProperties = chatBgImage
    ? { backgroundImage: `url("${chatBgImage}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : chatBgColor
    ? { backgroundColor: chatBgColor }
    : {
        backgroundColor: theme.vars.chatBg,
        ...(theme.config.hasBgPattern
          ? {
              backgroundImage: `url("${isDark ? WA_PATTERN_DARK : WA_PATTERN_LIGHT}")`,
              backgroundRepeat: 'repeat',
              backgroundSize: '60px 60px',
            }
          : {}),
      };

  const firstOther  = messages.find((m) => !m.isMe && m.type !== 'system');
  const headerColor = firstOther
    ? (characters[firstOther.sender]?.color ?? getAvatarColor(firstOther.sender))
    : getAvatarColor(contactName);

  // Compute one timestamp string per message
  const messageTimestamps = messages.map((_, i) => {
    const t = autoStepTime ? stepTimeHHMM(conversationTime, i) : conversationTime;
    return formatConversationTime(t, timeFormat);
  });

  // Status bar shows 12h format (no AM/PM label, like a real phone)
  const statusTimeStr = formatConversationTime(conversationTime, '12h');

  const typingColor = typingFor
    ? (characters[typingFor]?.color ?? getAvatarColor(typingFor))
    : undefined;

  // Input text to show — only when Me is in typing phase and toggle is on
  const inputTypingText = isMeTyping && showMeTypingInInput ? meTypingText : undefined;

  return (
    <div
      className="flex flex-col overflow-hidden relative"
      style={{ width, height, fontFamily: theme.config.fontFamily }}
    >
      {/* Status bar */}
      <div
        className="shrink-0 flex items-center justify-between px-4 py-1.5 text-[11px] font-semibold"
        style={{ backgroundColor: theme.vars.statusBar, color: theme.vars.headerText }}
      >
        <span>{statusTimeStr}</span>
        <div className="flex items-center gap-1.5 opacity-80">
          <span>●●●</span>
          <span>WiFi</span>
          <span>🔋</span>
        </div>
      </div>

      {/* Chat header */}
      <ChatHeader
        theme={theme}
        contactName={contactName}
        contactStatus={typingFor ? 'typing…' : contactStatus}
        avatarColor={headerColor}
      />

      {/* Message area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden py-2"
        style={{ ...bgStyle, scrollBehavior: 'smooth' }}
      >
        <div className="flex flex-col gap-0.5">
          {visibleMessages.map((msg) => (
            <ChatBubble
              key={msg.id}
              message={msg}
              theme={theme}
              character={characters[msg.sender]}
              tickState={msg.isMe ? (tickStates[msg.id] ?? 'sent') : undefined}
              timestamp={messageTimestamps[messages.indexOf(msg)] ?? formatConversationTime(conversationTime, timeFormat)}
            />
          ))}

          <AnimatePresence>
            {typingFor && (
              <TypingIndicator
                key="typing"
                theme={theme}
                sender={typingFor}
                senderColor={typingColor}
              />
            )}
          </AnimatePresence>
        </div>

        <div className="h-1" />
      </div>

      {/* Input bar */}
      <ChatInput theme={theme} typingText={inputTypingText} />

      {/* iOS Keyboard overlay — slides up from bottom */}
      <AnimatePresence>
        {isMeTyping && showKeyboard && (
          <motion.div
            key="keyboard"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320, mass: 0.9 }}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20 }}
          >
            <Keyboard theme={theme} isDark={isDark} width={width} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
