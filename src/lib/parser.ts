import type { ParsedMessage, MessageType } from '@/types';

const IMAGE_REGEX = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg|avif)(\?.*)?$/i;
const ARABIC_REGEX = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;
const URL_REGEX = /^https?:\/\//i;
// [Photo] alone (multi-line format)
const MEDIA_TAG_ALONE = /^\[(photo|image|video|img)\]$/i;
// [Photo] https://... — inline format (the common TheFake format)
const MEDIA_TAG_INLINE = /^\[(photo|image|video|img)\]\s+(https?:\/\/.+)$/i;

function detectMessageType(content: string): MessageType {
  if (IMAGE_REGEX.test(content)) return 'image';
  if (content.startsWith('[system]')) return 'system';
  return 'text';
}

function isRTL(text: string): boolean {
  return ARABIC_REGEX.test(text);
}

function parseSystemMessage(content: string): string {
  return content.replace('[system]', '').trim();
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function parseScript(script: string, meAlias = 'Me'): ParsedMessage[] {
  if (!script.trim()) return [];

  const rawLines = script.split('\n');
  const messages: ParsedMessage[] = [];
  let i = 0;

  while (i < rawLines.length) {
    const trimmed = rawLines[i].trim();
    i++;
    if (!trimmed) continue;

    // System message shorthand: --- text ---
    if (trimmed.startsWith('---') && trimmed.endsWith('---')) {
      messages.push({
        id: generateId(),
        sender: 'system',
        content: trimmed.replace(/^-+\s*/, '').replace(/\s*-+$/, '').trim(),
        type: 'system',
        isMe: false,
        isRTL: false,
        isFirstInGroup: true,
        isLastInGroup: true,
      });
      continue;
    }

    const colonIdx = trimmed.indexOf(':');
    if (colonIdx <= 0) continue;

    const sender = trimmed.slice(0, colonIdx).trim();
    let rawContent = trimmed.slice(colonIdx + 1).trim();

    if (!sender || !rawContent) continue;

    // [Photo] https://... — inline format (most common, TheFake style)
    let forcedImage = false;
    const inlineMatch = rawContent.match(MEDIA_TAG_INLINE);
    if (inlineMatch) {
      rawContent = inlineMatch[2].trim();
      forcedImage = true;
    }
    // [Photo] alone — URL on the next non-empty line
    else if (MEDIA_TAG_ALONE.test(rawContent)) {
      while (i < rawLines.length && !rawLines[i].trim()) i++;
      if (i < rawLines.length && URL_REGEX.test(rawLines[i].trim())) {
        rawContent = rawLines[i].trim();
        i++;
        forcedImage = true;
      } else {
        continue; // No URL found — skip
      }
    }

    const type: MessageType = forcedImage ? 'image' : detectMessageType(rawContent);
    const content = type === 'system' ? parseSystemMessage(rawContent) : rawContent;
    const meMatch = sender.toLowerCase() === meAlias.toLowerCase();

    messages.push({
      id: generateId(),
      sender,
      content,
      type,
      isMe: meMatch,
      isRTL: isRTL(content),
      isFirstInGroup: false,
      isLastInGroup: false,
    });
  }

  // Mark group boundaries
  for (let j = 0; j < messages.length; j++) {
    const msg  = messages[j];
    const prev = messages[j - 1];
    const next = messages[j + 1];

    msg.isFirstInGroup =
      !prev || prev.sender !== msg.sender || prev.type === 'system' || msg.type === 'system';

    msg.isLastInGroup =
      !next || next.sender !== msg.sender || next.type === 'system' || msg.type === 'system';
  }

  return messages;
}

export function recalcGroupBoundaries(messages: ParsedMessage[]): ParsedMessage[] {
  return messages.map((msg, j) => {
    const prev = messages[j - 1];
    const next = messages[j + 1];
    return {
      ...msg,
      isFirstInGroup: !prev || prev.sender !== msg.sender || prev.type === 'system' || msg.type === 'system',
      isLastInGroup:  !next || next.sender !== msg.sender || next.type === 'system' || msg.type === 'system',
    };
  });
}

export function messagesToScript(messages: ParsedMessage[]): string {
  return messages
    .map((msg) => {
      if (msg.type === 'system') return `--- ${msg.content} ---`;
      if (msg.type === 'image')  return `${msg.sender}: [photo] ${msg.content}`;
      return `${msg.sender}: ${msg.content}`;
    })
    .join('\n');
}

export function extractSenders(messages: ParsedMessage[]): string[] {
  const seen = new Set<string>();
  const senders: string[] = [];
  for (const msg of messages) {
    if (msg.type !== 'system' && !seen.has(msg.sender)) {
      seen.add(msg.sender);
      senders.push(msg.sender);
    }
  }
  return senders;
}
