'use client';

import type { ChatTheme } from '@/types';
import { getInitials, getAvatarColor } from '@/lib/utils';

interface ChatHeaderProps {
  theme: ChatTheme;
  contactName: string;
  contactStatus: string;
  avatarColor?: string;
}

function BackArrow({ color }: { color: string }) {
  return (
    <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
      <path d="M8.5 1.5L1.5 8L8.5 14.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChatHeader({ theme, contactName, contactStatus, avatarColor }: ChatHeaderProps) {
  const color = avatarColor ?? getAvatarColor(contactName);
  const initials = getInitials(contactName);
  const isCenter = theme.config.headerLayout === 'center-avatar';

  return (
    <div
      className="shrink-0 flex items-center px-3 py-2 gap-3 shadow-sm"
      style={{ backgroundColor: theme.vars.headerBg }}
    >
      {/* Back arrow */}
      <button className="flex items-center gap-0.5 opacity-80">
        <BackArrow color={theme.vars.headerText} />
        {theme.id === 'imessage' && (
          <span className="text-xs" style={{ color: theme.vars.accent }}>1</span>
        )}
      </button>

      {isCenter ? (
        // iMessage: center layout
        <div className="flex-1 flex flex-col items-center">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white mb-0.5"
            style={{ backgroundColor: color }}
          >
            {initials}
          </div>
          <span className="text-xs font-semibold" style={{ color: theme.vars.headerText }}>
            {contactName}
          </span>
          {contactStatus && (
            <span className="text-[10px]" style={{ color: theme.vars.headerSubtext }}>
              {contactStatus}
            </span>
          )}
        </div>
      ) : (
        // WhatsApp / Telegram / Instagram: left layout
        <>
          <div className="relative shrink-0">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{ backgroundColor: color }}
            >
              {initials}
            </div>
            {contactStatus === 'online' && (
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-400 border-2"
                style={{ borderColor: theme.vars.headerBg }} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: theme.vars.headerText }}>
              {contactName}
            </p>
            {contactStatus && (
              <p className="text-[11px] truncate" style={{ color: theme.vars.headerSubtext }}>
                {contactStatus}
              </p>
            )}
          </div>
        </>
      )}

      {/* Action icons */}
      <div className="flex items-center gap-3 shrink-0">
        {(theme.id === 'whatsapp' || theme.id === 'telegram') && (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15.5 8.5A4.5 4.5 0 0 1 12 13a4.5 4.5 0 0 1-3.5-4.5A4.5 4.5 0 0 1 12 4a4.5 4.5 0 0 1 3.5 4.5z" stroke={theme.vars.headerText} strokeWidth="1.5" opacity="0.7"/>
              <path d="M4 21c0-3.3 3.6-6 8-6s8 2.7 8 6" stroke={theme.vars.headerText} strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
            </svg>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="5" r="1.5" fill={theme.vars.headerText} opacity="0.7"/>
              <circle cx="12" cy="12" r="1.5" fill={theme.vars.headerText} opacity="0.7"/>
              <circle cx="12" cy="19" r="1.5" fill={theme.vars.headerText} opacity="0.7"/>
            </svg>
          </>
        )}
        {theme.id === 'imessage' && (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.7 10.8 19.79 19.79 0 01.67 2.18 2 2 0 012.65 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L7.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z" stroke={theme.vars.accent} strokeWidth="1.5"/>
          </svg>
        )}
        {theme.id === 'instagram' && (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke={theme.vars.headerText} strokeWidth="1.5" opacity="0.7"/>
            <path d="M12 8v8M8 12h8" stroke={theme.vars.headerText} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
          </svg>
        )}
      </div>
    </div>
  );
}
