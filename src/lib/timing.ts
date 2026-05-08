/**
 * Remotion timing helpers — thin wrappers around chatTimeline so that
 * the exported video uses exactly the same human-pacing as the live preview.
 */

import type { ParsedMessage } from '@/types';
import { buildTimeline, getTimelineDurationMs, timelineToFrames } from './chatTimeline';

export { buildTimeline, getTimelineDurationMs, timelineToFrames };

const FPS = 30;

// ── Types used by the Remotion composition ──────────────────────────────────

export interface FrameTiming {
  id: string;
  typingStartFrame: number;
  messageStartFrame: number;
  deliveredFrame: number;
  readFrame: number;
  nextMessageFrame: number;
}

// ── Public helpers ───────────────────────────────────────────────────────────

export function calculateTimings(messages: ParsedMessage[], speed = 1): FrameTiming[] {
  const timeline = buildTimeline(messages, speed);
  return timelineToFrames(timeline, FPS);
}

export function getTotalFrames(messages: ParsedMessage[], speed = 1): number {
  if (messages.length === 0) return FPS * 3;
  const timeline = buildTimeline(messages, speed);
  const durationMs = getTimelineDurationMs(timeline);
  return Math.round((durationMs / 1000) * FPS);
}

export function getDurationSeconds(messages: ParsedMessage[], speed = 1): number {
  return getTotalFrames(messages, speed) / FPS;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `${s}s`;
}
