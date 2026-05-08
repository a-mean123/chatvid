/* eslint-disable @typescript-eslint/no-explicit-any */
import { Composition } from 'remotion';
import type { ParsedMessage, ThemeId, AspectRatio, Character } from '@/types';
import type { TimeFormat } from '@/lib/utils';
import { getTheme } from '@/themes';
import { getTotalFrames } from '@/lib/timing';
import { ASPECT_RATIO_DIMS } from '@/lib/utils';
import { ChatScene } from './ChatScene';

export interface CompositionProps {
  messages: ParsedMessage[];
  themeId: ThemeId;
  isDark: boolean;
  aspectRatio: AspectRatio;
  animationSpeed: number;
  contactName: string;
  contactStatus: string;
  characters: Record<string, Character>;
  meAlias: string;
  showMeTypingInInput: boolean;
  showKeyboard: boolean;
  conversationTime: string;
  timeFormat: TimeFormat;
  autoStepTime: boolean;
  chatBgColor: string;
  chatBgImage: string;
  watermark:   boolean;
}

const FPS = 30;

function ChatVideo(props: CompositionProps) {
  const theme = getTheme(props.themeId, props.isDark);
  return (
    <ChatScene
      messages={props.messages}
      theme={theme}
      characters={props.characters}
      contactName={props.contactName}
      contactStatus={props.contactStatus}
      animationSpeed={props.animationSpeed}
      showMeTypingInInput={props.showMeTypingInInput}
      showKeyboard={props.showKeyboard}
      conversationTime={props.conversationTime}
      timeFormat={props.timeFormat}
      autoStepTime={props.autoStepTime}
      chatBgColor={props.chatBgColor}
      chatBgImage={props.chatBgImage}
      watermark={props.watermark}
    />
  );
}

const DEFAULT_PROPS: CompositionProps = {
  messages: [],
  themeId: 'whatsapp',
  isDark: false,
  aspectRatio: '9:16',
  animationSpeed: 1,
  contactName: 'Contact',
  contactStatus: 'online',
  characters: {},
  meAlias: 'Me',
  showMeTypingInInput: false,
  showKeyboard: false,
  conversationTime: '13:00',
  timeFormat: '24h',
  autoStepTime: false,
  chatBgColor: '',
  chatBgImage: '',
  watermark:   false,
};

export function RemotionRoot() {
  const dims = ASPECT_RATIO_DIMS['9:16'];

  return (
    <Composition
      id="ChatVideo"
      component={ChatVideo as any}
      durationInFrames={FPS * 30}
      fps={FPS}
      width={dims.width}
      height={dims.height}
      defaultProps={DEFAULT_PROPS as any}
      calculateMetadata={async ({ props }: { props: any; defaultProps: any; abortSignal: AbortSignal; compositionId: string; isRendering: boolean }) => {
        const p = props as CompositionProps;
        const totalFrames = getTotalFrames(p.messages, p.animationSpeed);
        const d = ASPECT_RATIO_DIMS[p.aspectRatio] ?? dims;
        return {
          durationInFrames: Math.max(totalFrames, FPS * 2),
          fps: FPS,
          width: d.width,
          height: d.height,
          props: p as any,
        };
      }}
    />
  );
}
