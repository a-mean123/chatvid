'use client';

import type { ChatTheme } from '@/types';

interface ChatInputProps {
  theme: ChatTheme;
  typingText?: string;
}

export function ChatInput({ theme, typingText }: ChatInputProps) {
  const isTyping = typingText !== undefined;
  return (
    <div
      className="shrink-0 flex items-center gap-2 px-2 py-2"
      style={{ backgroundColor: theme.vars.chatBg }}
    >
      {/* Attachment */}
      {(theme.id === 'whatsapp' || theme.id === 'telegram') && (
        <button className="p-1.5 rounded-full shrink-0" style={{ color: theme.vars.timestamp }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}

      {/* Input field */}
      <div
        className="flex-1 flex items-center px-4 py-2.5 min-h-10"
        style={{
          backgroundColor: theme.vars.inputBg,
          border: `1px solid ${theme.vars.inputBorder}`,
          borderRadius: theme.config.inputStyle === 'pill' ? '24px' : '8px',
        }}
      >
        {isTyping ? (
          <span className="text-sm" style={{ color: theme.vars.theirBubbleText }}>
            {typingText}
            <span style={{
              display: 'inline-block',
              width: 1.5,
              height: '1em',
              backgroundColor: theme.vars.accent,
              marginLeft: 1,
              verticalAlign: 'text-bottom',
              animation: 'cursor-blink 1s step-end infinite',
            }} />
          </span>
        ) : (
          <span className="text-sm" style={{ color: theme.vars.timestamp }}>
            Message
          </span>
        )}
      </div>

      {/* Mic / Send */}
      <button
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: theme.vars.accent }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d="M12 2a3 3 0 013 3v6a3 3 0 11-6 0V5a3 3 0 013-3z"/>
          <path d="M19 10a7 7 0 01-14 0M12 19v3M9 22h6" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        </svg>
      </button>
    </div>
  );
}
