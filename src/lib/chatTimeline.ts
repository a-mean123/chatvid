import type { ParsedMessage } from '@/types';

// ---------------------------------------------------------------------------
// Deterministic PRNG — same seed always gives the same "random" value.
// This is critical: same script = same timing every preview/export run.
// ---------------------------------------------------------------------------
function prng(seed: number): number {
  let s = (seed ^ 0x9e3779b9) >>> 0;
  s = Math.imul(s ^ (s >>> 16), 0x45d9f3b) >>> 0;
  s = Math.imul(s ^ (s >>> 16), 0x45d9f3b) >>> 0;
  return ((s ^ (s >>> 16)) >>> 0) / 0xffffffff;
}

/** Returns a multiplier in [low, high] seeded by (msgIdx, variantKey). */
function jitter(msgIdx: number, variantKey: number, low = 0.8, high = 1.2): number {
  return low + prng(msgIdx * 31 + variantKey * 17) * (high - low);
}

// ---------------------------------------------------------------------------
// Message content analysis helpers
// ---------------------------------------------------------------------------
const EMOJI_RE = /^[\p{Emoji_Presentation}\p{Extended_Pictographic}\s]+$/u;

function isEmojiOnly(text: string): boolean {
  return EMOJI_RE.test(text.trim());
}

function isBurstMessage(msg: ParsedMessage, prev: ParsedMessage | null): boolean {
  return !!prev && prev.sender === msg.sender && prev.type !== 'system' && msg.type !== 'system';
}

// ---------------------------------------------------------------------------
// Core timing calculators (all return milliseconds)
// ---------------------------------------------------------------------------

/**
 * How long the typing indicator stays visible.
 * Scales with text length, capped, with human jitter.
 */
function calcTypingMs(msg: ParsedMessage, idx: number, speed: number): number {
  if (msg.type === 'system') return 0;

  if (msg.type === 'image') {
    // Simulate "uploading" — longer hold
    return Math.round((1400 * jitter(idx, 1, 0.7, 1.5)) / speed);
  }

  const text = msg.content;

  if (isEmojiOnly(text)) {
    // Emoji replies are instant — tiny bubble, fast fingers
    return Math.round((220 * jitter(idx, 2, 0.7, 1.3)) / speed);
  }

  const len = text.length;
  // "Me" messages: we type faster in our head (viewer is "me")
  const base   = msg.isMe ? 320 : 580;
  const perChar = msg.isMe ? 20  : 34;
  const cap    = msg.isMe ? 2000 : 4200;
  const raw    = base + len * perChar;
  const v      = jitter(idx, 3, 0.68, 1.42);
  return Math.round(Math.min(raw * v, cap) / speed);
}

/**
 * Pause BEFORE typing starts — "read delay + think time".
 * Cross-sender switches are longer; bursts from same sender are very short.
 */
function calcReadDelayMs(
  msg: ParsedMessage,
  prev: ParsedMessage | null,
  idx: number,
  speed: number
): number {
  if (idx === 0) {
    return Math.round((650 * jitter(idx, 4, 0.8, 1.2)) / speed);
  }

  if (isBurstMessage(msg, prev)) {
    // Same sender typing another bubble quickly — feels like they hit send fast
    return Math.round((260 * jitter(idx, 5, 0.4, 1.6)) / speed);
  }

  // Cross-sender: they read the previous message first, then think
  const prevLen  = prev?.type === 'text' ? (prev.content.length ?? 20) : 40;
  const readTime = Math.min(prevLen * 16, 1600);       // reading time scales with length
  const thinkBase = msg.isMe ? 380 : 820;              // "me" replies faster
  const thinkTime = thinkBase * jitter(idx, 6, 0.5, 2.1);

  // ~18% chance of a "distraction pause" — they put the phone down briefly
  const distracted = prng(idx * 43 + 7) > 0.82;
  const distractionMs = distracted ? 1800 * jitter(idx, 7, 0.8, 2.2) : 0;

  return Math.round((readTime + thinkTime + distractionMs) / speed);
}

/**
 * Short pause AFTER the message bubble appears, before the NEXT message's
 * read-delay begins. Tiny gap — keeps the rhythm without feeling rushed.
 */
function calcPostPauseMs(
  msg: ParsedMessage,
  next: ParsedMessage | null,
  idx: number,
  speed: number
): number {
  if (!next) return Math.round((1200 * jitter(idx, 8, 0.8, 1.3)) / speed);

  if (isBurstMessage(next, msg)) {
    // Next message is a burst from same sender — almost no gap
    return Math.round((120 * jitter(idx, 9, 0.5, 1.6)) / speed);
  }

  return Math.round((300 * jitter(idx, 9, 0.6, 1.6)) / speed);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface MessageTimingEntry {
  id: string;
  // Relative timings (ms from previous message's sequenceEndMs)
  readDelayMs: number;
  typingDurationMs: number;
  postPauseMs: number;
  // Absolute from playback t=0
  typingStartMs: number;
  messageShowMs: number;
  deliveredMs: number;   // when double-tick appears (my messages)
  readMs: number;        // when colored tick appears (my messages)
  sequenceEndMs: number; // when next message's countdown starts
}

export function buildTimeline(
  messages: ParsedMessage[],
  speedMultiplier = 1
): MessageTimingEntry[] {
  const entries: MessageTimingEntry[] = [];
  let cursor = 0; // absolute ms position

  for (let i = 0; i < messages.length; i++) {
    const msg  = messages[i];
    const prev = messages[i - 1] ?? null;
    const next = messages[i + 1] ?? null;

    const readDelay = calcReadDelayMs(msg, prev, i, speedMultiplier);
    const typing    = calcTypingMs(msg, i, speedMultiplier);
    const post      = calcPostPauseMs(msg, next, i, speedMultiplier);

    const typingStart = cursor + readDelay;
    const messageShow = typingStart + typing;
    const sequenceEnd = messageShow + post;

    entries.push({
      id: msg.id,
      readDelayMs: readDelay,
      typingDurationMs: typing,
      postPauseMs: post,
      typingStartMs: typingStart,
      messageShowMs: messageShow,
      deliveredMs: messageShow + Math.round(650  * jitter(i, 10, 0.6, 1.5)),
      readMs:      messageShow + Math.round(2100 * jitter(i, 11, 0.7, 1.9)),
      sequenceEndMs: sequenceEnd,
    });

    cursor = sequenceEnd;
  }

  return entries;
}

/** Total animation duration in ms (last message shown + 2.5s hold). */
export function getTimelineDurationMs(entries: MessageTimingEntry[]): number {
  if (entries.length === 0) return 3000;
  return entries[entries.length - 1].messageShowMs + 2500;
}

/** Convert the timeline to frame-based offsets for Remotion (30 fps). */
export function timelineToFrames(entries: MessageTimingEntry[], fps = 30) {
  return entries.map((e) => ({
    id: e.id,
    typingStartFrame:  Math.round((e.typingStartMs  / 1000) * fps),
    messageStartFrame: Math.round((e.messageShowMs  / 1000) * fps),
    deliveredFrame:    Math.round((e.deliveredMs    / 1000) * fps),
    readFrame:         Math.round((e.readMs         / 1000) * fps),
    nextMessageFrame:  Math.round((e.sequenceEndMs  / 1000) * fps),
  }));
}
