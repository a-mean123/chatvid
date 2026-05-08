'use client';

import { useState, useEffect, useRef } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { PRESET_TEMPLATES } from '@/lib/templates';
import { cn, getAvatarColor, getInitials } from '@/lib/utils';
import { extractSenders } from '@/lib/parser';
import type { ParsedMessage } from '@/types';

export function ScriptEditor() {
  const {
    script, setScript,
    messages,
    meAlias, setMeAlias,
    contactName, setContactName,
    contactStatus, setContactStatus,
    characters, setCharacter,
    isPlaying, play, pause, reset,
    conversationTime,
    deleteMessage, updateMessage, moveMessage, addMessage, toggleReaction,
  } = useChatStore();

  const [activeTab, setActiveTab]   = useState<'script' | 'settings' | 'chars'>('script');
  const [rawMode, setRawMode]       = useState(false);
  const textareaRef                  = useRef<HTMLTextAreaElement>(null);

  const senders      = extractSenders(messages);
  const otherSenders = senders.filter((s) => s.toLowerCase() !== meAlias.toLowerCase());

  const handleAddMessage = (isMe: boolean) => {
    const sender = isMe ? meAlias : (otherSenders[0] ?? contactName ?? 'Contact');
    addMessage(sender, '…');
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 border-r border-zinc-800">
      {/* Tab bar */}
      <div className="flex border-b border-zinc-800 shrink-0">
        {(['script', 'settings', 'chars'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 py-2.5 text-xs font-medium capitalize transition-colors',
              activeTab === tab
                ? 'text-white border-b-2 border-indigo-500'
                : 'text-zinc-500 hover:text-zinc-300'
            )}
          >
            {tab === 'script'   && '📝 Script'}
            {tab === 'settings' && '⚙️ Settings'}
            {tab === 'chars'    && '👤 Chars'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* ── Script Tab ─────────────────────────────────────────────────────── */}
        {activeTab === 'script' && (
          <div className={cn('flex flex-col p-3 gap-3', rawMode && 'h-full')}>

            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Messages</p>
                <p className="text-[10px] text-zinc-600 mt-0.5">
                  {rawMode ? 'Editing raw script' : 'Use arrows to reorder'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRawMode((v) => !v)}
                  className="px-2 py-0.5 rounded border border-zinc-700 text-[10px] text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 transition-all"
                >
                  {rawMode ? 'Cards' : 'Raw'}
                </button>
                {messages.length > 0 && (
                  <button
                    onClick={() => setScript('')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] text-zinc-400 hover:text-red-400 hover:bg-red-500/10 border border-zinc-700 hover:border-red-500/30 transition-all"
                  >
                    🗑 Clear all
                  </button>
                )}
                <span className="min-w-5.5 h-5.5 flex items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white px-1.5">
                  {messages.length}
                </span>
              </div>
            </div>

            {rawMode ? (
              /* ── Raw textarea ────────────────────────────────────────────── */
              <>
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    spellCheck={false}
                    placeholder={`Alex: hey bro\nMe: what's up?\nAlex: you need to learn coding\nMe: maybe`}
                    className="w-full min-h-64 h-full bg-zinc-800 text-zinc-100 text-sm font-mono rounded-xl border border-zinc-700 p-4 resize-none focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-zinc-600"
                  />
                  <div className="absolute bottom-3 right-3 text-[10px] text-zinc-600">
                    {messages.length} messages
                  </div>
                </div>

                <div className="rounded-xl bg-zinc-800/60 border border-zinc-700/50 p-3 text-xs text-zinc-400 space-y-1">
                  <p className="font-medium text-zinc-300">Syntax:</p>
                  <p><span className="text-indigo-400">Name:</span> message text</p>
                  <p><span className="text-indigo-400">Me:</span> your reply</p>
                  <p><span className="text-zinc-500">--- separator ---</span> system msg</p>
                  <p><span className="text-indigo-400">Name:</span> [photo] https://…</p>
                </div>
              </>
            ) : (
              /* ── Card list ───────────────────────────────────────────────── */
              <>
                {messages.length === 0 && (
                  <p className="text-center text-xs text-zinc-600 py-8">
                    No messages yet. Add one below or switch to Raw.
                  </p>
                )}

                <div className="flex flex-col gap-2">
                  {messages.map((msg, i) => (
                    <MessageCard
                      key={msg.id}
                      msg={msg}
                      index={i}
                      total={messages.length}
                      senders={senders}
                      meAlias={meAlias}
                      conversationTime={conversationTime}
                      onMove={moveMessage}
                      onDelete={deleteMessage}
                      onUpdate={updateMessage}
                      onToggleReaction={toggleReaction}
                    />
                  ))}
                </div>

                {/* Add message buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddMessage(false)}
                    className="flex-1 py-2 rounded-xl border border-dashed border-zinc-700 text-xs text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 transition-all"
                  >
                    + {otherSenders[0] ?? contactName ?? 'Contact'}
                  </button>
                  <button
                    onClick={() => handleAddMessage(true)}
                    className="flex-1 py-2 rounded-xl border border-dashed border-indigo-500/30 text-xs text-indigo-400/70 hover:text-indigo-400 hover:border-indigo-500 transition-all"
                  >
                    + Me
                  </button>
                </div>
              </>
            )}

            {/* Playback controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={reset}
                className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all"
                title="Reset"
              >
                ⏮
              </button>
              <button
                onClick={isPlaying ? pause : play}
                className={cn(
                  'flex-1 py-2 rounded-xl text-sm font-medium transition-all',
                  isPlaying
                    ? 'bg-zinc-700 text-white hover:bg-zinc-600'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                )}
              >
                {isPlaying ? '⏸ Pause' : '▶ Play Preview'}
              </button>
            </div>

            {/* Templates */}
            <div>
              <p className="text-xs font-medium text-zinc-500 mb-2">Templates</p>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { setScript(t.script); if (rawMode) setRawMode(false); }}
                    className="text-left p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/50 hover:border-zinc-600 transition-all group"
                  >
                    <div className="text-base mb-0.5">{t.icon}</div>
                    <div className="text-xs font-medium text-zinc-300 group-hover:text-white">{t.name}</div>
                    <div className="text-[10px] text-zinc-600 mt-0.5 truncate">{t.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Settings Tab ───────────────────────────────────────────────────── */}
        {activeTab === 'settings' && (
          <div className="p-4 space-y-5">
            <Section title="Identity">
              <Field label="'Me' alias">
                <input value={meAlias} onChange={(e) => setMeAlias(e.target.value)} className={inputCls} placeholder="Me" />
              </Field>
              <Field label="Contact name">
                <input value={contactName} onChange={(e) => setContactName(e.target.value)} className={inputCls} placeholder="Contact name" />
              </Field>
              <Field label="Status">
                <select value={contactStatus} onChange={(e) => setContactStatus(e.target.value)} className={inputCls}>
                  <option value="online">Online</option>
                  <option value="typing">Typing…</option>
                  <option value="last seen today">Last seen today</option>
                  <option value="last seen recently">Last seen recently</option>
                  <option value="">No status</option>
                </select>
              </Field>
            </Section>
          </div>
        )}

        {/* ── Characters Tab ─────────────────────────────────────────────────── */}
        {activeTab === 'chars' && (
          <div className="p-4 space-y-3">
            <p className="text-xs text-zinc-500">Customize avatars and display names.</p>
            {senders.length === 0 && (
              <p className="text-xs text-zinc-600 text-center py-8">Add messages to the script first.</p>
            )}
            {senders.map((sender) => {
              const char = characters[sender];
              const isMe = sender.toLowerCase() === meAlias.toLowerCase();
              return (
                <div key={sender} className="bg-zinc-800 rounded-xl p-3 border border-zinc-700/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                      style={{ backgroundColor: char?.color ?? getAvatarColor(sender) }}
                    >
                      {getInitials(char?.name ?? sender)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{sender}</p>
                      {isMe && <span className="text-[10px] text-indigo-400 font-medium">YOU</span>}
                    </div>
                  </div>
                  <Field label="Display name">
                    <input
                      value={char?.name ?? sender}
                      onChange={(e) => setCharacter(sender, { name: e.target.value })}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Avatar color">
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={char?.color ?? getAvatarColor(sender)}
                        onChange={(e) => setCharacter(sender, { color: e.target.value })}
                        className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                      />
                      <span className="text-xs text-zinc-400">{char?.color ?? getAvatarColor(sender)}</span>
                    </div>
                  </Field>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── MessageCard ──────────────────────────────────────────────────────────────

const COMMON_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🔥', '💯', '👏', '😍', '🙏', '😎'];

function MessageCard({
  msg, index, total, senders, meAlias, conversationTime, onMove, onDelete, onUpdate, onToggleReaction,
}: {
  msg: ParsedMessage;
  index: number;
  total: number;
  senders: string[];
  meAlias: string;
  conversationTime: string;
  onMove: (id: string, dir: -1 | 1) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, patch: { content?: string; sender?: string }) => void;
  onToggleReaction: (id: string, emoji: string) => void;
}) {
  const [draft, setDraft]         = useState(msg.content);
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef                   = useRef<HTMLDivElement>(null);

  useEffect(() => { setDraft(msg.content); }, [msg.id]);

  // Close picker on outside click
  useEffect(() => {
    if (!showPicker) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showPicker]);

  const commit   = () => { if (draft !== msg.content) onUpdate(msg.id, { content: draft }); };
  const reactions = msg.reactions ?? [];

  // ── System message ──────────────────────────────────────────────────────
  if (msg.type === 'system') {
    return (
      <div className="flex items-center gap-1.5">
        <ArrowCol index={index} total={total} id={msg.id} onMove={onMove} />
        <div className="flex-1 flex items-center gap-2 bg-zinc-800/50 border border-zinc-700/30 rounded-xl px-3 py-2">
          <span className="text-[10px] text-zinc-600 flex-1 text-center italic">── {msg.content} ──</span>
          <button
            onClick={() => onDelete(msg.id)}
            className="text-zinc-700 hover:text-red-400 text-xs transition-colors"
          >
            🗑
          </button>
        </div>
      </div>
    );
  }

  const senderOptions = senders.includes(msg.sender) ? senders : [...senders, msg.sender];

  return (
    <div className={cn('flex items-start gap-1.5', msg.isMe && 'flex-row-reverse')}>
      <ArrowCol index={index} total={total} id={msg.id} onMove={onMove} />

      <div className={cn(
        'flex-1 min-w-0 rounded-xl border p-2.5',
        msg.isMe ? 'bg-indigo-500/10 border-indigo-500/25' : 'bg-zinc-800 border-zinc-700/50'
      )}>
        {/* Header row */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <select
            value={msg.sender}
            onChange={(e) => onUpdate(msg.id, { sender: e.target.value })}
            className={cn(
              'bg-transparent text-xs font-semibold border-none outline-none cursor-pointer truncate max-w-22.5',
              msg.isMe ? 'text-indigo-300' : 'text-zinc-300'
            )}
          >
            {senderOptions.map((s) => (
              <option key={s} value={s} className="bg-zinc-800 text-zinc-200">{s}</option>
            ))}
          </select>
          <span className="text-[10px] text-zinc-600 shrink-0">{conversationTime}</span>
          <div className={cn('flex items-center gap-0.5', msg.isMe ? 'mr-auto' : 'ml-auto')}>
            {/* Emoji picker trigger */}
            <div className="relative" ref={pickerRef}>
              <button
                onClick={() => setShowPicker((v) => !v)}
                className={cn(
                  'p-1 rounded text-sm transition-all',
                  showPicker
                    ? 'bg-indigo-500/20 text-indigo-300'
                    : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-700'
                )}
                title="Add reaction"
              >
                {reactions.length > 0 ? reactions[reactions.length - 1] : '🙂'}
              </button>

              {showPicker && (
                <div className={cn(
                  'absolute z-30 bg-zinc-800 border border-zinc-600 rounded-2xl p-2 shadow-2xl',
                  'grid grid-cols-6 gap-1 w-44',
                  msg.isMe ? 'right-0' : 'left-0',
                  'top-8'
                )}>
                  {COMMON_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => { onToggleReaction(msg.id, emoji); setShowPicker(false); }}
                      className={cn(
                        'w-6 h-6 flex items-center justify-center rounded-lg text-base hover:bg-zinc-700 transition-colors',
                        reactions.includes(emoji) && 'bg-indigo-500/30 ring-1 ring-indigo-500/50'
                      )}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => onDelete(msg.id)}
              className="p-1 rounded text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all text-xs"
              title="Delete"
            >
              🗑
            </button>
          </div>
        </div>

        {/* Content */}
        {msg.type === 'image' ? (
          <div className="space-y-1">
            {draft && (
              <div className="rounded-lg overflow-hidden h-16 bg-zinc-700/40">
                <img
                  src={draft}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            )}
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              className="w-full bg-transparent text-[10px] text-zinc-500 font-mono outline-none"
              placeholder="Image URL"
            />
          </div>
        ) : (
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            rows={Math.max(1, Math.ceil(draft.length / 28))}
            className="w-full bg-transparent text-sm text-zinc-200 resize-none outline-none leading-snug"
            style={{ direction: msg.isRTL ? 'rtl' : 'ltr' }}
          />
        )}

        {/* Reaction pills */}
        {reactions.length > 0 && (
          <div className={cn('flex flex-wrap gap-1 mt-1.5', msg.isMe ? 'justify-end' : 'justify-start')}>
            {reactions.map((emoji) => (
              <button
                key={emoji}
                onClick={() => onToggleReaction(msg.id, emoji)}
                className="bg-zinc-700/60 hover:bg-red-500/20 rounded-full px-1.5 py-0.5 text-base leading-none transition-colors"
                title="Remove reaction"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── ArrowCol ─────────────────────────────────────────────────────────────────

function ArrowCol({
  index, total, id, onMove,
}: {
  index: number;
  total: number;
  id: string;
  onMove: (id: string, dir: -1 | 1) => void;
}) {
  return (
    <div className="flex flex-col gap-0.5 shrink-0 pt-2">
      <button
        onClick={() => onMove(id, -1)}
        disabled={index === 0}
        className="w-5 h-5 flex items-center justify-center rounded text-zinc-600 hover:text-white hover:bg-zinc-700 disabled:opacity-20 disabled:cursor-not-allowed transition-all text-[10px]"
      >
        ▲
      </button>
      <button
        onClick={() => onMove(id, 1)}
        disabled={index === total - 1}
        className="w-5 h-5 flex items-center justify-center rounded text-zinc-600 hover:text-white hover:bg-zinc-700 disabled:opacity-20 disabled:cursor-not-allowed transition-all text-[10px]"
      >
        ▼
      </button>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const inputCls =
  'w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-zinc-400">{label}</label>
      {children}
    </div>
  );
}
