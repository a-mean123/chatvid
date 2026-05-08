'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeId, AspectRatio, ParsedMessage, Character } from '@/types';
import { parseScript, extractSenders, recalcGroupBoundaries, messagesToScript } from '@/lib/parser';
import { getAvatarColor, type TimeFormat } from '@/lib/utils';

const DEFAULT_SCRIPT = `Alex: hey bro
Me: what's up?
Alex: wanna see something crazy
Me: sure what is it
Alex: i just got my first coding job
Me: NO WAY
Alex: yes way 😂
Alex: 95k a year
Me: dude that's insane
Alex: i used that course you sent me
Me: i told you!!
Alex: best decision ever
Me: we're celebrating tonight
Alex: 🎉🎉🎉`;

interface ChatState {
  script: string;
  messages: ParsedMessage[];
  meAlias: string;
  contactName: string;
  contactStatus: string;

  themeId: ThemeId;
  isDark: boolean;
  aspectRatio: AspectRatio;
  animationSpeed: number;
  showPhoneFrame: boolean;
  soundEnabled: boolean;
  showMeTypingInInput: boolean;
  showKeyboard: boolean;
  conversationTime: string;
  timeFormat: TimeFormat;
  autoStepTime: boolean;
  chatBgColor: string;
  chatBgImage: string;

  characters: Record<string, Character>;

  isPlaying: boolean;
  currentIndex: number;
  visibleCount: number;

  isExporting: boolean;
  exportProgress: number;

  setScript: (script: string) => void;
  setMeAlias: (alias: string) => void;
  setContactName: (name: string) => void;
  setContactStatus: (status: string) => void;
  setThemeId: (id: ThemeId) => void;
  toggleDark: () => void;
  setAspectRatio: (ratio: AspectRatio) => void;
  setAnimationSpeed: (speed: number) => void;
  togglePhoneFrame: () => void;
  toggleSound: () => void;
  toggleMeTypingInInput: () => void;
  toggleKeyboard: () => void;
  setConversationTime: (t: string) => void;
  setTimeFormat: (f: TimeFormat) => void;
  toggleAutoStepTime: () => void;
  setChatBgColor: (color: string) => void;
  setChatBgImage: (url: string) => void;
  setCharacter: (sender: string, char: Partial<Character>) => void;

  toggleReaction: (id: string, emoji: string) => void;
  deleteMessage: (id: string) => void;
  updateMessage: (id: string, patch: { content?: string; sender?: string }) => void;
  moveMessage: (id: string, direction: -1 | 1) => void;
  addMessage: (sender: string, content: string) => void;

  play: () => void;
  pause: () => void;
  reset: () => void;
  setVisibleCount: (n: number) => void;

  setExporting: (v: boolean) => void;
  setExportProgress: (p: number) => void;

  setDark: (v: boolean) => void;
  loadProject: (data: { script?: string; settings?: Record<string, unknown>; messages?: ParsedMessage[] }) => void;
}

function buildCharacters(
  senders: string[],
  meAlias: string,
  existing: Record<string, Character>
): Record<string, Character> {
  const chars: Record<string, Character> = {};
  for (const sender of senders) {
    chars[sender] = existing[sender] ?? {
      name: sender,
      color: getAvatarColor(sender),
    };
  }
  return chars;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      script: DEFAULT_SCRIPT,
      messages: parseScript(DEFAULT_SCRIPT, 'Me'),
      meAlias: 'Me',
      contactName: 'Alex',
      contactStatus: 'online',

      themeId: 'whatsapp',
      isDark: false,
      aspectRatio: '9:16',
      animationSpeed: 1,
      showPhoneFrame: true,
      soundEnabled: false,
      showMeTypingInInput: true,
      showKeyboard: false,
      conversationTime: '12:00',
      timeFormat: '24h' as TimeFormat,
      autoStepTime: false,
      chatBgColor: '',
      chatBgImage: '',

      characters: buildCharacters(
        extractSenders(parseScript(DEFAULT_SCRIPT, 'Me')),
        'Me',
        {}
      ),

      isPlaying: false,
      currentIndex: 0,
      visibleCount: 0,

      isExporting: false,
      exportProgress: 0,

      setScript: (script) => {
        const { meAlias, characters } = get();
        const messages = parseScript(script, meAlias);
        const senders = extractSenders(messages);
        const newChars = buildCharacters(senders, meAlias, characters);
        set({ script, messages, characters: newChars, currentIndex: 0, visibleCount: 0, isPlaying: false });
      },

      setMeAlias: (meAlias) => {
        const { script, characters } = get();
        const messages = parseScript(script, meAlias);
        const senders = extractSenders(messages);
        const newChars = buildCharacters(senders, meAlias, characters);
        set({ meAlias, messages, characters: newChars });
      },

      setContactName: (contactName) => set({ contactName }),
      setContactStatus: (contactStatus) => set({ contactStatus }),
      setThemeId: (themeId) => set({ themeId }),
      toggleDark: () => set((s) => ({ isDark: !s.isDark })),
      setAspectRatio: (aspectRatio) => set({ aspectRatio }),
      setAnimationSpeed: (animationSpeed) => set({ animationSpeed }),
      togglePhoneFrame: () => set((s) => ({ showPhoneFrame: !s.showPhoneFrame })),
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      toggleMeTypingInInput: () => set((s) => ({ showMeTypingInInput: !s.showMeTypingInInput })),
      toggleKeyboard: () => set((s) => ({ showKeyboard: !s.showKeyboard })),
      setConversationTime: (conversationTime) => set({ conversationTime }),
      setTimeFormat: (timeFormat) => set({ timeFormat }),
      toggleAutoStepTime: () => set((s) => ({ autoStepTime: !s.autoStepTime })),
      setChatBgColor: (chatBgColor) => set({ chatBgColor, chatBgImage: '' }),
      setChatBgImage: (chatBgImage) => set({ chatBgImage }),

      setCharacter: (sender, char) =>
        set((s) => ({
          characters: {
            ...s.characters,
            [sender]: { ...s.characters[sender], ...char },
          },
        })),

      toggleReaction: (id, emoji) => {
        const { messages } = get();
        const next = messages.map((m) => {
          if (m.id !== id) return m;
          const cur = m.reactions ?? [];
          const reactions = cur.includes(emoji) ? cur.filter((e) => e !== emoji) : [...cur, emoji];
          return { ...m, reactions };
        });
        set({ messages: next });
      },

      deleteMessage: (id) => {
        const { messages, meAlias, characters } = get();
        const next = recalcGroupBoundaries(messages.filter((m) => m.id !== id));
        const senders = extractSenders(next);
        set({ messages: next, script: messagesToScript(next), characters: buildCharacters(senders, meAlias, characters) });
      },

      updateMessage: (id, patch) => {
        const { messages, meAlias, characters } = get();
        const ARABIC = /[؀-ۿ]/;
        const next = recalcGroupBoundaries(
          messages.map((m) => {
            if (m.id !== id) return m;
            const content = patch.content ?? m.content;
            const sender  = patch.sender  ?? m.sender;
            return { ...m, content, sender, isMe: sender.toLowerCase() === meAlias.toLowerCase(), isRTL: ARABIC.test(content) };
          })
        );
        const senders = extractSenders(next);
        set({ messages: next, script: messagesToScript(next), characters: buildCharacters(senders, meAlias, characters) });
      },

      moveMessage: (id, direction) => {
        const { messages } = get();
        const idx = messages.findIndex((m) => m.id === id);
        if (idx < 0) return;
        const newIdx = idx + direction;
        if (newIdx < 0 || newIdx >= messages.length) return;
        const arr = [...messages];
        [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
        const next = recalcGroupBoundaries(arr);
        set({ messages: next, script: messagesToScript(next) });
      },

      addMessage: (sender, content) => {
        const { messages, meAlias, characters } = get();
        const ARABIC = /[؀-ۿ]/;
        const newMsg: ParsedMessage = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          sender,
          content,
          type: 'text',
          isMe: sender.toLowerCase() === meAlias.toLowerCase(),
          isRTL: ARABIC.test(content),
          isFirstInGroup: false,
          isLastInGroup: false,
        };
        const next = recalcGroupBoundaries([...messages, newMsg]);
        const senders = extractSenders(next);
        set({ messages: next, script: messagesToScript(next), characters: buildCharacters(senders, meAlias, characters) });
      },

      play: () => set({ isPlaying: true }),
      pause: () => set({ isPlaying: false }),
      reset: () => set({ isPlaying: false, currentIndex: 0, visibleCount: 0 }),
      setVisibleCount: (visibleCount) => set({ visibleCount }),

      setExporting: (isExporting) => set({ isExporting }),
      setExportProgress: (exportProgress) => set({ exportProgress }),

      setDark: (isDark) => set({ isDark }),

      loadProject: (data) => {
        const s       = (data.settings ?? {}) as Record<string, unknown>;
        const script  = data.script ?? '';
        const meAlias = (s.meAlias as string) ?? 'Me';
        const msgs    = Array.isArray(data.messages) && data.messages.length
          ? recalcGroupBoundaries(data.messages as ParsedMessage[])
          : parseScript(script, meAlias);
        const senders = extractSenders(msgs);
        const chars   = buildCharacters(senders, meAlias, (s.characters as Record<string, Character>) ?? {});
        set({
          script, messages: msgs, meAlias, characters: chars,
          contactName:         (s.contactName as string)  ?? 'Contact',
          contactStatus:       (s.contactStatus as string) ?? 'online',
          themeId:             (s.themeId as ThemeId)     ?? 'whatsapp',
          isDark:              (s.isDark as boolean)       ?? false,
          aspectRatio:         (s.aspectRatio as AspectRatio) ?? '9:16',
          animationSpeed:      (s.animationSpeed as number)   ?? 1,
          showMeTypingInInput: (s.showMeTypingInInput as boolean) ?? true,
          showKeyboard:        (s.showKeyboard as boolean) ?? false,
          conversationTime:    (s.conversationTime as string) ?? '12:00',
          timeFormat:          (s.timeFormat as TimeFormat)   ?? '24h',
          autoStepTime:        (s.autoStepTime as boolean)    ?? false,
          chatBgColor:         (s.chatBgColor as string) ?? '',
          chatBgImage:         (s.chatBgImage as string) ?? '',
          isPlaying: false, currentIndex: 0, visibleCount: 0,
        });
      },
    }),
    {
      name: 'chat-video-store',
      partialize: (s) => ({
        script: s.script,
        meAlias: s.meAlias,
        contactName: s.contactName,
        contactStatus: s.contactStatus,
        themeId: s.themeId,
        isDark: s.isDark,
        aspectRatio: s.aspectRatio,
        animationSpeed: s.animationSpeed,
        showPhoneFrame: s.showPhoneFrame,
        showMeTypingInInput: s.showMeTypingInInput,
        showKeyboard: s.showKeyboard,
        conversationTime: s.conversationTime,
        timeFormat: s.timeFormat,
        autoStepTime: s.autoStepTime,
        chatBgColor: s.chatBgColor,
        chatBgImage: s.chatBgImage,
        characters: s.characters,
      }),
    }
  )
);
