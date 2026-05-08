import { interpolate, spring, useCurrentFrame, useVideoConfig, Img } from 'remotion';
import type { ParsedMessage, ChatTheme, Character } from '@/types';
import { getInitials, getAvatarColor } from '@/lib/utils';

type TickState = 'sent' | 'delivered' | 'read';

interface RemoteBubbleProps {
  message: ParsedMessage;
  theme: ChatTheme;
  character?: Character;
  startFrame: number;
  tickState?: TickState;
  /** Uniform scale factor = videoWidth / 390 */
  sx: number;
  timestamp: string;
  imageW: number;
  imageMaxH: number;
}

function TickIcon({ tickState, theme, sx }: { tickState: TickState; theme: ChatTheme; sx: number }) {
  const isRead      = tickState === 'read';
  const isDelivered = tickState === 'delivered' || isRead;
  const color       = isRead ? theme.vars.tick : theme.vars.timestamp;

  if (!isDelivered) {
    // Single tick — sent
    return (
      <svg width={14 * sx} height={10 * sx} viewBox="0 0 14 10" fill="none" style={{ display: 'inline-block', marginLeft: 2 * sx }}>
        <path d="M1 5L5 9L13 1" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // Double tick — delivered / read
  return (
    <svg width={18 * sx} height={11 * sx} viewBox="0 0 18 11" fill="none" style={{ display: 'inline-block', marginLeft: 2 * sx }}>
      <path d="M1 5.5L5 9.5L13 1.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity={isRead ? 1 : 0.45} />
      <path d="M5 5.5L9 9.5L17 1.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity={isRead ? 1 : 0.45} />
    </svg>
  );
}

export function ChatBubbleRemote({ message, theme, character, startFrame, tickState, sx, timestamp, imageW, imageMaxH }: RemoteBubbleProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isMe = message.isMe;
  const relFrame = frame - startFrame;

  const progress = spring({
    frame: relFrame,
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.8 },
  });

  const opacity    = interpolate(relFrame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });
  const translateY = interpolate(progress, [0, 1], [10 * sx, 0]);
  const scale      = interpolate(progress, [0, 1], [0.95, 1]);

  const avatarColor = character?.color ?? getAvatarColor(message.sender);
  const initials    = getInitials(character?.name ?? message.sender);

  const avatarSize    = Math.round(28 * sx);
  const fontSize      = Math.round(15 * sx);
  const smallFontSize = Math.round(11 * sx);
  const tinyFontSize  = Math.round(10 * sx);
  const padH          = Math.round(12 * sx);
  const padV          = Math.round(8 * sx);

  const timeStr = timestamp;

  if (relFrame < 0) return null;

  if (message.type === 'system') {
    return (
      <div style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        display: 'flex',
        justifyContent: 'center',
        padding: `${4 * sx}px ${16 * sx}px`,
      }}>
        <span style={{
          fontSize: smallFontSize,
          color: theme.vars.timestamp,
          backgroundColor: theme.vars.separator,
          padding: `${2 * sx}px ${12 * sx}px`,
          borderRadius: 99,
        }}>
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div style={{
      opacity,
      transform: `translateY(${translateY}px) scale(${scale})`,
      display: 'flex',
      alignItems: 'flex-end',
      flexDirection: 'row',
      gap: 8 * sx,
      padding: `${2 * sx}px ${padH}px`,
    }}>

      {/* Avatar slot — always reserve space to keep alignment consistent */}
      {!isMe && (
        <div style={{ width: avatarSize, height: avatarSize, flexShrink: 0 }}>
          {message.isLastInGroup && (
            <div style={{
              width: avatarSize,
              height: avatarSize,
              borderRadius: '50%',
              backgroundColor: avatarColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: Math.round(10 * sx),
              fontWeight: 700,
              color: '#fff',
            }}>
              {initials}
            </div>
          )}
        </div>
      )}

      <div style={{
        maxWidth: '75%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: isMe ? 'flex-end' : 'flex-start',
        marginLeft: isMe ? 'auto' : undefined,
      }}>
        {/* Sender name for first in group */}
        {!isMe && message.isFirstInGroup && (
          <span style={{
            fontSize: smallFontSize,
            fontWeight: 600,
            color: avatarColor,
            marginBottom: 2 * sx,
            padding: `0 ${4 * sx}px`,
          }}>
            {character?.name ?? message.sender}
          </span>
        )}

        {message.type === 'image' ? (
          /* Outer bubble box — gives the "message box" look */
          <div style={{
            backgroundColor: isMe ? theme.vars.myBubbleBg : theme.vars.theirBubbleBg,
            borderRadius: isMe ? theme.config.myBubbleRadius : theme.config.theirBubbleRadius,
            padding: Math.round(4 * sx),
            boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
          }}>
            {/* Inner image with overlaid timestamp */}
            <div style={{
              position: 'relative',
              borderRadius: Math.round(6 * sx),
              overflow: 'hidden',
              width: imageW,
              height: imageMaxH,
            }}>
              <Img
                src={message.content}
                style={{ width: imageW, height: imageMaxH, objectFit: 'fill', display: 'block' }}
              />
              <div style={{
                position: 'absolute',
                bottom: Math.round(6 * sx),
                right: Math.round(8 * sx),
                backgroundColor: 'rgba(0,0,0,0.45)',
                borderRadius: 99,
                padding: `${Math.round(2 * sx)}px ${Math.round(6 * sx)}px`,
                display: 'flex',
                alignItems: 'center',
                gap: Math.round(3 * sx),
              }}>
                <span style={{ fontSize: tinyFontSize, color: '#fff', lineHeight: 1 }}>{timeStr}</span>
                {isMe && tickState && theme.config.tickStyle !== 'none' && (
                  <TickIcon tickState={tickState} theme={theme} sx={sx} />
                )}
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            backgroundColor: isMe ? theme.vars.myBubbleBg : theme.vars.theirBubbleBg,
            borderRadius: isMe ? theme.config.myBubbleRadius : theme.config.theirBubbleRadius,
            padding: `${padV}px ${padH}px`,
            boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
          }}>
            <p style={{
              fontSize,
              lineHeight: 1.5,
              margin: 0,
              color: isMe ? theme.vars.myBubbleText : theme.vars.theirBubbleText,
              fontFamily: theme.config.fontFamily,
              direction: message.isRTL ? 'rtl' : 'ltr',
              textAlign: message.isRTL ? 'right' : 'left',
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
            }}>
              {message.content}
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isMe ? 'flex-end' : 'flex-start',
              gap: 2 * sx,
              marginTop: 2 * sx,
            }}>
              <span style={{ fontSize: tinyFontSize, color: theme.vars.timestamp }}>
                {timeStr}
              </span>
              {isMe && tickState && theme.config.tickStyle !== 'none' && (
                <TickIcon tickState={tickState} theme={theme} sx={sx} />
              )}
            </div>
          </div>
        )}

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: Math.round(4 * sx),
            marginTop: Math.round(4 * sx),
            justifyContent: isMe ? 'flex-end' : 'flex-start',
          }}>
            {message.reactions.map((emoji, i) => (
              <span key={i} style={{
                backgroundColor: theme.vars.inputBg,
                border: `1px solid ${theme.vars.inputBorder}`,
                borderRadius: 99,
                padding: `${Math.round(2 * sx)}px ${Math.round(6 * sx)}px`,
                fontSize: Math.round(13 * sx),
                lineHeight: 1,
              }}>
                {emoji}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
