import { useCurrentFrame, useVideoConfig, interpolate, Audio, Sequence, staticFile, delayRender, continueRender } from 'remotion';
import { useState, useEffect } from 'react';
import type { ParsedMessage, ChatTheme, Character } from '@/types';
import { calculateTimings } from '@/lib/timing';
import { ChatBubbleRemote } from './ChatBubbleRemote';
import { getAvatarColor, getInitials, formatConversationTime, stepTimeHHMM, type TimeFormat } from '@/lib/utils';

interface ChatSceneProps {
  messages: ParsedMessage[];
  theme: ChatTheme;
  characters: Record<string, Character>;
  contactName: string;
  contactStatus: string;
  animationSpeed: number;
  showMeTypingInInput?: boolean;
  showKeyboard?: boolean;
  conversationTime?: string;
  timeFormat?: TimeFormat;
  autoStepTime?: boolean;
  chatBgColor?: string;
  chatBgImage?: string;
  watermark?:  boolean;
}

const WA_BG_PATTERN = `repeating-linear-gradient(
  45deg,
  transparent,
  transparent 10px,
  rgba(0,0,0,0.03) 10px,
  rgba(0,0,0,0.03) 20px
)`;


// ── Typing dots (only used for non-Me senders) ──────────────────────────────
function TypingDots({ theme, sx }: { theme: ChatTheme; sx: number }) {
  const frame = useCurrentFrame();
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', gap: 8 * sx,
      padding: `2px ${12 * sx}px`,
    }}>
      <div style={{ width: 28 * sx, height: 28 * sx }} />
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4 * sx,
        backgroundColor: theme.vars.theirBubbleBg,
        borderRadius: theme.config.theirBubbleRadius,
        padding: `${10 * sx}px ${14 * sx}px`,
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
      }}>
        {[0, 1, 2].map((i) => {
          const y = interpolate(
            (frame + i * 8) % 24,
            [0, 8, 16, 24],
            [0, -5 * sx, 0, 0],
          );
          return (
            <div key={i} style={{
              width: 8 * sx, height: 8 * sx, borderRadius: '50%',
              backgroundColor: theme.vars.typingDot,
              transform: `translateY(${y}px)`,
            }} />
          );
        })}
      </div>
    </div>
  );
}

// ── Inline keyboard (no Framer Motion — Remotion is frame-based) ─────────────
const KB_ROW1 = ['Q','W','E','R','T','Y','U','I','O','P'];
const KB_ROW2 = ['A','S','D','F','G','H','J','K','L'];
const KB_ROW3_MID = ['Z','X','C','V','B','N','M'];

function KeyboardRemote({ isDark, sx }: { isDark: boolean; sx: number }) {
  const keyH   = Math.round(42 * sx);
  const gap    = Math.round(6 * sx);
  const r      = Math.round(5 * sx);
  const fs     = Math.round(16 * sx);
  const sfs    = Math.round(13 * sx);
  const keyBg  = isDark ? '#3a3a3c' : '#ffffff';
  const specBg = isDark ? '#636366' : '#adb5bd';
  const keyTxt = isDark ? '#ffffff' : '#000000';
  const barBg  = isDark ? '#1c1c1e' : '#d1d5db';
  const shadow = isDark ? 'none' : '0 1px 0 rgba(0,0,0,0.3)';
  const row2Pad = Math.round(20 * sx);
  const padH   = Math.round(3 * sx);

  function Key({ label, flex = 1, spec = false }: { label: string; flex?: number; spec?: boolean }) {
    return (
      <div style={{
        flex, height: keyH,
        backgroundColor: spec ? specBg : keyBg,
        borderRadius: r,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: spec ? sfs : fs,
        color: keyTxt,
        fontWeight: spec ? 400 : 500,
        boxShadow: shadow,
      }}>
        {label}
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: barBg,
      padding: `${Math.round(8 * sx)}px ${padH}px ${Math.round(20 * sx)}px`,
      display: 'flex', flexDirection: 'column', gap,
    }}>
      <div style={{ display: 'flex', gap }}>
        {KB_ROW1.map((k) => <Key key={k} label={k} />)}
      </div>
      <div style={{ display: 'flex', gap, paddingLeft: row2Pad, paddingRight: row2Pad }}>
        {KB_ROW2.map((k) => <Key key={k} label={k} />)}
      </div>
      <div style={{ display: 'flex', gap }}>
        <Key label="⇧" flex={1.4} spec />
        <div style={{ flex: 0.2 }} />
        {KB_ROW3_MID.map((k) => <Key key={k} label={k} />)}
        <div style={{ flex: 0.2 }} />
        <Key label="⌫" flex={1.4} spec />
      </div>
      <div style={{ display: 'flex', gap }}>
        <Key label="123" flex={2} spec />
        <Key label="" flex={5} />
        <Key label="return" flex={2.5} spec />
      </div>
    </div>
  );
}

export function ChatScene({
  messages, theme, characters, contactName, contactStatus, animationSpeed,
  showMeTypingInInput = false,
  showKeyboard = false,
  conversationTime = '13:00',
  timeFormat = '24h',
  autoStepTime = false,
  chatBgColor = '',
  chatBgImage = '',
  watermark   = false,
}: ChatSceneProps) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const sx = width / 390;
  const IMAGE_W       = Math.round(240 * sx);
  const IMAGE_CAP_H   = Math.round(300 * sx); // max height for very tall images

  // ── Pre-fetch image dimensions so height is based on real aspect ratio ────
  const [imageHeights, setImageHeights] = useState<Record<string, number>>({});
  const [renderHandle] = useState(() => {
    const hasImages = messages.some((m) => m.type === 'image');
    return hasImages ? delayRender('Loading image dimensions') : null;
  });

  useEffect(() => {
    if (!renderHandle) return;
    const imageMsgs = messages.filter((m) => m.type === 'image');
    const heights: Record<string, number> = {};
    let remaining = imageMsgs.length;

    imageMsgs.forEach((msg) => {
      const img = new window.Image();
      const finish = () => {
        remaining -= 1;
        if (remaining === 0) {
          setImageHeights(heights);
          continueRender(renderHandle);
        }
      };
      img.onload = () => {
        const ratio = img.naturalHeight / Math.max(1, img.naturalWidth);
        heights[msg.id] = Math.min(Math.round(IMAGE_W * ratio), IMAGE_CAP_H);
        finish();
      };
      img.onerror = () => {
        heights[msg.id] = Math.round(200 * sx); // fallback
        finish();
      };
      img.src = msg.content;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusBarH = Math.round(26 * sx);
  const headerH    = Math.round(58 * sx);
  const inputH     = Math.round(60 * sx);
  const msgPadV    = Math.round(8 * sx);
  const bubbleGap  = Math.round(4 * sx);

  const timings = calculateTimings(messages, animationSpeed);

  // ── Determine which messages are visible and what's being "typed" ─────────
  const visibleMessages: ParsedMessage[] = [];
  const tickStates: Record<string, 'sent' | 'delivered' | 'read'> = {};
  let typingMsg: ParsedMessage | null = null;

  for (let i = 0; i < messages.length; i++) {
    const t = timings[i];
    if (frame >= t.messageStartFrame) {
      visibleMessages.push(messages[i]);
      if (messages[i].isMe) {
        if (frame >= t.readFrame)           tickStates[messages[i].id] = 'read';
        else if (frame >= t.deliveredFrame) tickStates[messages[i].id] = 'delivered';
        else                                tickStates[messages[i].id] = 'sent';
      }
    } else if (frame >= t.typingStartFrame && messages[i].type !== 'system') {
      typingMsg = messages[i];
      break;
    }
  }

  const isMeTyping   = typingMsg?.isMe ?? false;
  const isThemTyping = typingMsg !== null && !isMeTyping;

  // ── Me typing text: interpolate progress through the message content ──────
  let meInputText = '';
  if (isMeTyping && typingMsg && showMeTypingInInput && typingMsg.type !== 'image') {
    const entry       = timings.find((t) => t.id === typingMsg!.id)!;
    const dur         = entry.messageStartFrame - entry.typingStartFrame;
    const elapsed     = frame - entry.typingStartFrame;
    const progress    = dur > 0 ? Math.min(1, elapsed / dur) : 1;
    meInputText = typingMsg.content.slice(0, Math.ceil(progress * typingMsg.content.length));
  }

  // Blinking cursor: on for 15 frames, off for 15 frames (0.5 Hz at 30 fps)
  const cursorVisible = frame % 30 < 15;

  // ── Layout heights — keyboard may reduce message area ─────────────────────
  const keyboardH = (isMeTyping && showKeyboard) ? Math.round(214 * sx) : 0;
  const msgAreaH  = height - statusBarH - headerH - inputH - keyboardH;

  const BOTTOM_GAP = Math.round(8 * sx); // fixed space below last bubble

  function getImageH(msg: ParsedMessage): number {
    return imageHeights[msg.id] ?? Math.round(200 * sx);
  }

  // ── Per-message height estimate — only used for scroll animation, not positioning ──
  function estimateMsgH(msg: ParsedMessage): number {
    if (msg.type === 'system') return Math.round(30 * sx);
    if (msg.type === 'image')  return getImageH(msg) + Math.round(12 * sx);
    const approxLines = Math.max(1, Math.ceil(msg.content.length / 30));
    return Math.round((44 + approxLines * 22) * sx);
  }

  // ── Scroll reveal animation ──────────────────────────────────────────────
  // CSS (flex-end + min-height:100%) always positions content correctly.
  // We add a translateY that starts at +lastMsgH (new message below visible area)
  // and eases to 0 — the final position is always exact, the animation is cosmetic.
  const estimatedTotalH = visibleMessages.reduce((s, m) => s + estimateMsgH(m) + bubbleGap, 0)
    + msgPadV + BOTTOM_GAP;
  const needsScroll = estimatedTotalH > msgAreaH;

  const REVEAL_FRAMES = 14;
  let scrollAnimY = 0;
  if (needsScroll && visibleMessages.length > 0) {
    const lastMsg    = visibleMessages[visibleMessages.length - 1];
    const lastTiming = timings.find((t) => t.id === lastMsg.id);
    if (lastTiming && frame < lastTiming.messageStartFrame + REVEAL_FRAMES) {
      const eased = interpolate(
        frame,
        [lastTiming.messageStartFrame, lastTiming.messageStartFrame + REVEAL_FRAMES],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (t) => 1 - Math.pow(1 - t, 2) },
      );
      scrollAnimY = estimateMsgH(lastMsg) * (1 - eased);
    }
  }

  // ── Timestamps ───────────────────────────────────────────────────────────
  const messageTimestamps = messages.map((_, i) => {
    const t = autoStepTime ? stepTimeHHMM(conversationTime, i) : conversationTime;
    return formatConversationTime(t, timeFormat);
  });
  const statusTimeStr = formatConversationTime(conversationTime, '12h');

  // ── Header avatar ─────────────────────────────────────────────────────────
  const firstOther   = messages.find((m) => !m.isMe && m.type !== 'system');
  const headerColor  = firstOther
    ? (characters[firstOther.sender]?.color ?? getAvatarColor(firstOther.sender))
    : getAvatarColor(contactName);

  const bgStyle: React.CSSProperties = chatBgImage
    ? { backgroundImage: `url("${chatBgImage}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : chatBgColor
    ? { backgroundColor: chatBgColor }
    : {
        backgroundColor: theme.vars.chatBg,
        ...(theme.config.hasBgPattern ? { backgroundImage: WA_BG_PATTERN } : {}),
      };

  const headerAvatarSize = Math.round(38 * sx);
  const headerFontSize   = Math.round(15 * sx);
  const subFontSize      = Math.round(11 * sx);
  const statusFontSize   = Math.round(11 * sx);
  const inputFontSize    = Math.round(14 * sx);
  const inputRadius      = theme.config.inputStyle === 'pill' ? 99 : 8 * sx;
  const micSize          = Math.round(40 * sx);

  // Header status text — only "them" typing shows in header
  const headerStatus = isThemTyping ? 'typing…' : contactStatus;

  // ── Audio cues — one <Audio> per message at its appearance frame ──────────
  const audioCues = timings
    .map((t, i) => ({ t, msg: messages[i] }))
    .filter(({ msg }) => msg.type !== 'system')
    .map(({ t, msg }) => ({
      src: staticFile(msg.isMe ? 'sound-send.wav' : 'sound-receive.wav'),
      startFrame: t.messageStartFrame,
    }));

  return (
    <div style={{ width, height, display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: theme.config.fontFamily, position: 'relative' }}>

      {/* ── Status bar ── */}
      <div style={{
        height: statusBarH, flexShrink: 0,
        backgroundColor: theme.vars.statusBar,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: `0 ${16 * sx}px`,
        fontSize: statusFontSize, fontWeight: 600, color: theme.vars.headerText,
      }}>
        <span>{statusTimeStr}</span>
        <span style={{ opacity: 0.7 }}>●●● WiFi 🔋</span>
      </div>

      {/* ── Chat header ── */}
      <div style={{
        height: headerH, flexShrink: 0,
        backgroundColor: theme.vars.headerBg,
        display: 'flex', alignItems: 'center', gap: 12 * sx,
        padding: `0 ${12 * sx}px`,
        boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
      }}>
        <svg width={10 * sx} height={16 * sx} viewBox="0 0 10 16" fill="none">
          <path d="M8.5 1.5L1.5 8L8.5 14.5" stroke={theme.vars.headerText} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div style={{
          width: headerAvatarSize, height: headerAvatarSize, borderRadius: '50%',
          backgroundColor: headerColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: Math.round(14 * sx), fontWeight: 700, color: '#fff', flexShrink: 0,
        }}>
          {getInitials(contactName)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: headerFontSize, fontWeight: 600, color: theme.vars.headerText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {contactName}
          </p>
          {headerStatus && (
            <p style={{ margin: 0, fontSize: subFontSize, color: theme.vars.headerSubtext }}>
              {headerStatus}
            </p>
          )}
        </div>
        <svg width={18 * sx} height={18 * sx} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="5" r="1.5" fill={theme.vars.headerText} opacity="0.7" />
          <circle cx="12" cy="12" r="1.5" fill={theme.vars.headerText} opacity="0.7" />
          <circle cx="12" cy="19" r="1.5" fill={theme.vars.headerText} opacity="0.7" />
        </svg>
      </div>

      {/* ── Message area ──
           Outer: position:relative + overflow:hidden.
           Inner: position:absolute + bottom:0 + min-height:100%.
             • Small content → min-height fills the area; messages start at the top.
             • Large content → div grows upward past the outer; old messages
               clip naturally at the top. No estimation used for positioning. ── */}
      <div style={{
        height: msgAreaH, flexShrink: 0, overflow: 'hidden',
        position: 'relative',
        ...bgStyle,
      }}>
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          minHeight: '100%',
          display: 'flex', flexDirection: 'column',
          gap: bubbleGap,
          padding: `${msgPadV}px 0 ${BOTTOM_GAP}px`,
          transform: `translateY(${scrollAnimY}px)`,
        }}>
          {visibleMessages.map((msg) => {
            const timing = timings.find((t) => t.id === msg.id);
            return (
              <ChatBubbleRemote
                key={msg.id}
                message={msg}
                theme={theme}
                character={characters[msg.sender]}
                startFrame={timing?.messageStartFrame ?? 0}
                tickState={msg.isMe ? tickStates[msg.id] : undefined}
                sx={sx}
                timestamp={messageTimestamps[messages.indexOf(msg)] ?? formatConversationTime(conversationTime, timeFormat)}
                imageW={IMAGE_W}
                imageMaxH={getImageH(msg)}
              />
            );
          })}

          {/* Typing dots — only for non-Me senders */}
          {isThemTyping && <TypingDots theme={theme} sx={sx} />}
        </div>
      </div>

      {/* ── Input bar ── */}
      <div style={{
        height: inputH, flexShrink: 0, overflow: 'hidden',
        backgroundColor: theme.vars.chatBg,
        display: 'flex', alignItems: 'center', gap: 8 * sx, padding: `0 ${8 * sx}px`,
      }}>
        {/* Attachment icon — WhatsApp / Telegram only */}
        {(theme.id === 'whatsapp' || theme.id === 'telegram') && (
          <div style={{
            width: Math.round(32 * sx), height: Math.round(32 * sx),
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            color: theme.vars.timestamp,
          }}>
            <svg width={20 * sx} height={20 * sx} viewBox="0 0 24 24" fill="none">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}

        <div style={{
          flex: 1, overflow: 'hidden',
          backgroundColor: theme.vars.inputBg,
          border: `1px solid ${theme.vars.inputBorder}`,
          borderRadius: inputRadius,
          height: Math.round(42 * sx),
          boxSizing: 'border-box',
          padding: `0 ${Math.round(16 * sx)}px`,
          fontSize: inputFontSize,
          display: 'flex', alignItems: 'center',
        }}>
          {isMeTyping && showMeTypingInInput ? (
            <span style={{
              color: theme.vars.theirBubbleText,
              whiteSpace: 'nowrap', overflow: 'hidden',
              display: 'flex', alignItems: 'center',
            }}>
              {meInputText}
              {cursorVisible && (
                <span style={{
                  display: 'inline-block',
                  width: Math.round(1.5 * sx),
                  height: '1em',
                  backgroundColor: theme.vars.accent,
                  marginLeft: Math.round(1 * sx),
                  verticalAlign: 'text-bottom',
                }} />
              )}
            </span>
          ) : (
            <span style={{ color: theme.vars.timestamp }}>Message</span>
          )}
        </div>

        <div style={{
          width: micSize, height: micSize, borderRadius: '50%',
          backgroundColor: theme.vars.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width={16 * sx} height={16 * sx} viewBox="0 0 24 24" fill="white">
            <path d="M12 2a3 3 0 013 3v6a3 3 0 11-6 0V5a3 3 0 013-3z" />
            <path d="M19 10a7 7 0 01-14 0M12 19v3" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </svg>
        </div>
      </div>

      {/* ── Keyboard — only shown when Me is typing + toggle on ── */}
      {isMeTyping && showKeyboard && (
        <div style={{ flexShrink: 0, height: keyboardH, overflow: 'hidden' }}>
          <KeyboardRemote isDark={theme.dark} sx={sx} />
        </div>
      )}

      {/* ── Watermark ── */}
      {watermark && (
        <div style={{
          position: 'absolute', top: Math.round(16 * sx), right: Math.round(16 * sx),
          backgroundColor: 'rgba(0,0,0,0.45)',
          padding: `${Math.round(5 * sx)}px ${Math.round(12 * sx)}px`,
          borderRadius: Math.round(20 * sx),
          fontSize: Math.round(13 * sx), color: 'rgba(255,255,255,0.85)',
          fontWeight: 600, zIndex: 100,
        }}>
          ChatVid Free
        </div>
      )}

      {/* ── Audio cues — one per message ── */}
      {audioCues.map(({ src, startFrame }, i) => (
        <Sequence key={i} from={startFrame} durationInFrames={20}>
          <Audio src={src} volume={0.6} />
        </Sequence>
      ))}
    </div>
  );
}
