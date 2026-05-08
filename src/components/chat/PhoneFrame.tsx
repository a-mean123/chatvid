'use client';

import { useChatStore } from '@/store/useChatStore';
import { ChatPreview } from './ChatPreview';
import { getPreviewDims } from '@/lib/utils';
import { cn } from '@/lib/utils';

export function PhoneFrame() {
  const { showPhoneFrame, aspectRatio, isDark } = useChatStore();
  const dims = getPreviewDims(aspectRatio);

  if (!showPhoneFrame) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="overflow-hidden shadow-2xl rounded-2xl" style={{ width: dims.width, height: dims.height }}>
          <ChatPreview width={dims.width} height={dims.height} />
        </div>
      </div>
    );
  }

  // Phone frame only makes sense for portrait ratios
  const isPortrait = aspectRatio === '9:16' || aspectRatio === '4:5';

  if (!isPortrait) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="overflow-hidden shadow-2xl rounded-2xl border-2 border-zinc-700" style={{ width: dims.width, height: dims.height }}>
          <ChatPreview width={dims.width} height={dims.height} />
        </div>
      </div>
    );
  }

  const frameW = dims.width + 28;
  const frameH = dims.height + 80;

  return (
    <div className="flex items-center justify-center h-full">
      <div
        className={cn(
          'relative flex items-center justify-center rounded-[48px] shadow-2xl',
          isDark
            ? 'bg-zinc-800 border-2 border-zinc-700'
            : 'bg-zinc-900 border-2 border-zinc-700'
        )}
        style={{ width: frameW, height: frameH }}
      >
        {/* Notch / Dynamic Island */}
        <div
          className="absolute top-3 left-1/2 -translate-x-1/2 bg-black rounded-full z-20"
          style={{ width: 100, height: 28 }}
        />

        {/* Side buttons */}
        <div className="absolute -left-[3px] top-[100px] w-[3px] h-[40px] bg-zinc-600 rounded-l-sm" />
        <div className="absolute -left-[3px] top-[155px] w-[3px] h-[60px] bg-zinc-600 rounded-l-sm" />
        <div className="absolute -left-[3px] top-[228px] w-[3px] h-[60px] bg-zinc-600 rounded-l-sm" />
        <div className="absolute -right-[3px] top-[170px] w-[3px] h-[80px] bg-zinc-600 rounded-r-sm" />

        {/* Screen */}
        <div
          className="relative overflow-hidden rounded-[40px] z-10"
          style={{ width: dims.width, height: dims.height }}
        >
          <ChatPreview width={dims.width} height={dims.height} />
        </div>

        {/* Home indicator */}
        <div
          className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full opacity-60"
          style={{ width: 100, height: 4, backgroundColor: isDark ? '#fff' : '#fff' }}
        />
      </div>
    </div>
  );
}
