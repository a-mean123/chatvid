export type ThemeId = 'whatsapp' | 'imessage' | 'instagram' | 'telegram';
export type AspectRatio = '9:16' | '4:5' | '1:1' | '16:9';
export type MessageType = 'text' | 'image' | 'system';
export type AnimationSpeed = 0.5 | 1 | 1.5 | 2;

export interface ParsedMessage {
  id: string;
  sender: string;
  content: string;
  type: MessageType;
  isMe: boolean;
  isRTL: boolean;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  reactions?: string[];
}

export interface Character {
  name: string;
  color: string;
  avatar?: string;
}

export interface MessageTiming {
  id: string;
  typingStartFrame: number;
  messageStartFrame: number;
  nextMessageFrame: number;
  totalFrames: number;
}

export interface ChatThemeVars {
  chatBg: string;
  headerBg: string;
  headerText: string;
  headerSubtext: string;
  myBubbleBg: string;
  myBubbleText: string;
  theirBubbleBg: string;
  theirBubbleText: string;
  inputBg: string;
  inputBorder: string;
  accent: string;
  timestamp: string;
  tick: string;
  separator: string;
  typingDot: string;
  statusBar: string;
}

export interface ChatThemeConfig {
  myBubbleRadius: string;
  theirBubbleRadius: string;
  bubblePadding: string;
  fontFamily: string;
  headerLayout: 'left-avatar' | 'center-avatar';
  tickStyle: 'double-tick' | 'circle' | 'none';
  hasBgPattern: boolean;
  inputStyle: 'rounded' | 'pill';
  avatarSize: string;
}

export interface ChatTheme {
  id: ThemeId;
  name: string;
  icon: string;
  dark: boolean;
  vars: ChatThemeVars;
  config: ChatThemeConfig;
}

export interface PresetTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  script: string;
}
