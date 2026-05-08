import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const AVATAR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#82E0AA', '#F1948A', '#FAD7A0', '#A9CCE3', '#A3E4D7',
];

export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export type TimeFormat = '12h' | '24h';

export function getCurrentTimeHHMM(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

// Format HH:MM string into display format
export function formatConversationTime(hhmm: string, format: TimeFormat): string {
  const [h, m] = hhmm.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return hhmm;
  if (format === '12h') {
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')}`;
  }
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Add minutesDelta to HH:MM, wrapping at 24h
export function stepTimeHHMM(hhmm: string, minutesDelta: number): string {
  const [h, m] = hhmm.split(':').map(Number);
  const total = ((h * 60 + m + minutesDelta) % 1440 + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export const ASPECT_RATIO_DIMS: Record<string, { width: number; height: number }> = {
  '9:16': { width: 1080, height: 1920 },
  '4:5':  { width: 1080, height: 1350 },
  '1:1':  { width: 1080, height: 1080 },
  '16:9': { width: 1920, height: 1080 },
};

export function getPreviewDims(aspectRatio: string): { width: number; height: number } {
  const dims = ASPECT_RATIO_DIMS[aspectRatio] ?? { width: 1080, height: 1920 };
  const maxHeight = 680;
  const scale = maxHeight / dims.height;
  return {
    width: Math.round(dims.width * scale),
    height: Math.round(dims.height * scale),
  };
}
