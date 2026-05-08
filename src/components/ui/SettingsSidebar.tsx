'use client';

import { useChatStore } from '@/store/useChatStore';
import { getDurationSeconds, formatDuration } from '@/lib/timing';
import { cn } from '@/lib/utils';
import type { TimeFormat } from '@/lib/utils';

const SPEEDS = [0.5, 1, 1.5, 2];

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-4 py-3 border-b border-zinc-800">
      <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-2.5">
        {label}
      </p>
      {children}
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-1.5 flex-wrap">{children}</div>;
}

function Chip({
  active, onClick, children, title,
}: {
  active: boolean; onClick: () => void; children: React.ReactNode; title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        'px-2.5 py-1 rounded-lg text-xs font-medium transition-all',
        active ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
      )}
    >
      {children}
    </button>
  );
}

function Toggle({
  enabled, onClick, label, description,
}: {
  enabled: boolean; onClick: () => void; label: string; description?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between py-1.5 group"
    >
      <div className="text-left">
        <p className="text-xs text-zinc-300 group-hover:text-white transition-colors">{label}</p>
        {description && <p className="text-[10px] text-zinc-600 mt-0.5">{description}</p>}
      </div>
      <div className={cn(
        'relative w-8 h-4.5 rounded-full transition-colors shrink-0',
        enabled ? 'bg-indigo-600' : 'bg-zinc-700'
      )}>
        <div className={cn(
          'absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow transition-all',
          enabled ? 'left-[18px]' : 'left-0.5'
        )} />
      </div>
    </button>
  );
}

export function SettingsSidebar() {
  const {
    animationSpeed, setAnimationSpeed,
    conversationTime, setConversationTime,
    timeFormat, setTimeFormat,
    autoStepTime, toggleAutoStepTime,
    showPhoneFrame, togglePhoneFrame,
    soundEnabled, toggleSound,
    showMeTypingInInput, toggleMeTypingInInput,
    showKeyboard, toggleKeyboard,
    chatBgColor, setChatBgColor,
    chatBgImage, setChatBgImage,
    messages,
  } = useChatStore();

  const BG_PRESETS = [
    { label: 'Default', value: '' },
    { label: 'Green', value: '#d9fdd3' },
    { label: 'Dark',  value: '#0d1117' },
    { label: 'Beige', value: '#f5f0e8' },
    { label: 'Blue',  value: '#dce8ff' },
    { label: 'Pink',  value: '#ffe0e8' },
    { label: 'White', value: '#ffffff' },
  ];

  const duration = formatDuration(getDurationSeconds(messages, animationSpeed));

  return (
    <aside className="w-52 shrink-0 bg-zinc-900 border-l border-zinc-800 overflow-y-auto flex flex-col">

      {/* Animation speed */}
      <Section label="Animation">
        <Row>
          {SPEEDS.map((s) => (
            <Chip key={s} active={animationSpeed === s} onClick={() => setAnimationSpeed(s)}>
              {s}×
            </Chip>
          ))}
        </Row>
        <p className="text-[10px] text-zinc-600 mt-2">Duration: {duration}</p>
      </Section>

      {/* Time */}
      <Section label="Time">
        <div className="space-y-2">
          <div>
            <p className="text-[10px] text-zinc-500 mb-1">Clock</p>
            <input
              type="time"
              value={conversationTime}
              onChange={(e) => setConversationTime(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 mb-1">Format</p>
            <Row>
              {(['12h', '24h'] as TimeFormat[]).map((f) => (
                <Chip key={f} active={timeFormat === f} onClick={() => setTimeFormat(f)}>
                  {f}
                </Chip>
              ))}
            </Row>
          </div>
          <Toggle
            enabled={autoStepTime}
            onClick={toggleAutoStepTime}
            label="+1 min per message"
            description="Each message advances the clock"
          />
        </div>
      </Section>

      {/* Display */}
      <Section label="Display">
        <div className="space-y-0.5">
          <Toggle
            enabled={showPhoneFrame}
            onClick={togglePhoneFrame}
            label="Phone frame"
          />
          <Toggle
            enabled={soundEnabled}
            onClick={toggleSound}
            label="Sound effects"
          />
        </div>
      </Section>

      {/* Background */}
      <Section label="Background">
        <div className="space-y-2">
          {/* Color presets */}
          <div className="flex flex-wrap gap-1.5">
            {BG_PRESETS.map((p) => (
              <button
                key={p.value}
                onClick={() => setChatBgColor(p.value)}
                title={p.label}
                className="w-6 h-6 rounded-full border-2 transition-all"
                style={{
                  backgroundColor: p.value || '#52525b',
                  borderColor: chatBgColor === p.value && !chatBgImage ? '#6366f1' : 'transparent',
                }}
              />
            ))}
            {/* Custom color picker */}
            <label className="w-6 h-6 rounded-full border-2 border-dashed border-zinc-600 hover:border-zinc-400 cursor-pointer flex items-center justify-center overflow-hidden" title="Custom color">
              <input
                type="color"
                className="opacity-0 absolute w-0 h-0"
                value={chatBgColor || '#ffffff'}
                onChange={(e) => setChatBgColor(e.target.value)}
              />
              <span className="text-zinc-500 text-[10px]">+</span>
            </label>
          </div>
          {/* Image URL */}
          <div>
            <p className="text-[10px] text-zinc-500 mb-1">Image URL</p>
            <input
              type="text"
              placeholder="https://..."
              value={chatBgImage}
              onChange={(e) => setChatBgImage(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 placeholder-zinc-600"
            />
          </div>
          {(chatBgColor || chatBgImage) && (
            <button
              onClick={() => { setChatBgColor(''); setChatBgImage(''); }}
              className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              ↺ Reset to theme default
            </button>
          )}
        </div>
      </Section>

      {/* Me actor */}
      <Section label="Me actor">
        <div className="space-y-0.5">
          <Toggle
            enabled={showMeTypingInInput}
            onClick={toggleMeTypingInInput}
            label="Show typing in input"
            description="Animates text while Me types"
          />
          <Toggle
            enabled={showKeyboard}
            onClick={toggleKeyboard}
            label="Show keyboard"
            description="Slides up while Me types"
          />
        </div>
      </Section>

    </aside>
  );
}
