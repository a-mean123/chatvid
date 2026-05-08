import type { ChatTheme, ThemeId } from '@/types';
import { whatsappLight, whatsappDark } from './whatsapp';
import { imessageLight, imessageDark } from './imessage';
import { instagramLight, instagramDark } from './instagram';
import { telegramLight, telegramDark } from './telegram';

export const THEMES: Record<ThemeId, { light: ChatTheme; dark: ChatTheme }> = {
  whatsapp: { light: whatsappLight, dark: whatsappDark },
  imessage: { light: imessageLight, dark: imessageDark },
  instagram: { light: instagramLight, dark: instagramDark },
  telegram: { light: telegramLight, dark: telegramDark },
};

export function getTheme(id: ThemeId, dark: boolean): ChatTheme {
  return dark ? THEMES[id].dark : THEMES[id].light;
}

export const THEME_LIST: { id: ThemeId; name: string; icon: string }[] = [
  { id: 'whatsapp', name: 'WhatsApp', icon: '💬' },
  { id: 'imessage', name: 'iMessage', icon: '🍎' },
  { id: 'instagram', name: 'Instagram', icon: '📸' },
  { id: 'telegram', name: 'Telegram', icon: '✈️' },
];
