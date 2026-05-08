'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useChatStore } from '@/store/useChatStore';
import { getDurationSeconds, formatDuration } from '@/lib/timing';
import { ASPECT_RATIO_DIMS } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { getPlanLimits } from '@/lib/plans';

interface ExportPanelProps {
  onClose: () => void;
}

const PLAN_BADGE: Record<string, string> = {
  free:     'bg-zinc-700 text-zinc-300',
  pro:      'bg-indigo-600/25 text-indigo-300 border border-indigo-500/30',
  business: 'bg-purple-600/25 text-purple-300 border border-purple-500/30',
};

export function ExportPanel({ onClose }: ExportPanelProps) {
  const { data: session } = useSession();
  const {
    messages, themeId, isDark, aspectRatio, animationSpeed,
    contactName, contactStatus, characters, meAlias,
    showMeTypingInInput, showKeyboard,
    conversationTime, timeFormat, autoStepTime,
    chatBgColor, chatBgImage,
    isExporting, exportProgress,
    setExporting, setExportProgress,
  } = useChatStore();

  const [error,    setError]    = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [copied,   setCopied]   = useState(false);

  const plan   = session?.user?.plan ?? 'free';
  const limits = getPlanLimits(plan);

  const totalMessages   = messages.length;
  const exportedMessages = Math.min(totalMessages, limits.maxMessages);
  const willTruncate    = totalMessages > limits.maxMessages;
  const isFree          = plan === 'free';

  const duration = getDurationSeconds(
    messages.slice(0, exportedMessages),
    animationSpeed,
  );
  const dims = ASPECT_RATIO_DIMS[aspectRatio] ?? { width: 1080, height: 1920 };

  const handleExport = async () => {
    setError(null);
    setVideoUrl(null);
    setExporting(true);
    setExportProgress(0);

    let fakeProgress = 0;
    const progressInterval = setInterval(() => {
      fakeProgress = Math.min(fakeProgress + 2, 90);
      setExportProgress(fakeProgress);
    }, 500);

    try {
      const res = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages, themeId, isDark, aspectRatio, animationSpeed,
          contactName, contactStatus, characters, meAlias,
          showMeTypingInInput, showKeyboard, conversationTime,
          timeFormat, autoStepTime, chatBgColor, chatBgImage,
        }),
      });

      clearInterval(progressInterval);

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Render failed');
      }

      setExportProgress(100);

      const contentType = res.headers.get('Content-Type') ?? '';

      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (data.url) {
          setVideoUrl(data.url);
        } else {
          throw new Error(data.error ?? 'No URL returned');
        }
      } else {
        const blob = await res.blob();
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `chat-video-${Date.now()}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      clearInterval(progressInterval);
      setExporting(false);
    }
  };

  const handleDownload = () => {
    if (!videoUrl) return;
    const a    = document.createElement('a');
    a.href     = videoUrl;
    a.download = `chat-video-${Date.now()}.mp4`;
    a.target   = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopy = async () => {
    if (!videoUrl) return;
    await navigator.clipboard.writeText(videoUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md shadow-2xl">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <h2 className="text-white font-semibold text-lg">Export Video</h2>
            {session && (
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${PLAN_BADGE[plan] ?? PLAN_BADGE.free}`}>
                {plan}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors text-xl leading-none">×</button>
        </div>

        <div className="p-5 space-y-4">

          {/* ── Plan limits notices ── */}
          {willTruncate && (
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/25 p-4">
              <div className="flex items-start gap-3">
                <span className="text-amber-400 text-lg mt-0.5 shrink-0">⚠️</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-amber-300 mb-1">
                    Only {exportedMessages} of {totalMessages} messages will be exported
                  </p>
                  <p className="text-xs text-amber-300/70 leading-relaxed">
                    The <span className="capitalize font-medium">{plan}</span> plan is limited to{' '}
                    <span className="font-medium">{limits.maxMessages} messages</span> per export.
                    Upgrade to export the full conversation.
                  </p>
                </div>
              </div>
              <Link
                href="/pricing"
                className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Upgrade plan →
              </Link>
            </div>
          )}

          {limits.watermark && !willTruncate && (
            <div className="rounded-xl bg-zinc-800/60 border border-zinc-700 p-3.5 flex items-center gap-3">
              <span className="text-zinc-400 text-base shrink-0">🏷️</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-300 font-medium">Watermark will be added</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Free plan exports include a small ChatVid badge.{' '}
                  <Link href="/pricing" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
                    Remove it by upgrading.
                  </Link>
                </p>
              </div>
            </div>
          )}

          {limits.watermark && willTruncate && (
            <p className="text-xs text-zinc-500 px-1">
              🏷️ Free plan exports also include a ChatVid watermark.
            </p>
          )}

          {/* ── Stats grid ── */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Resolution', value: `${dims.width}×${dims.height}` },
              { label: 'Duration',   value: formatDuration(duration) },
              { label: 'Frame rate', value: '30 fps' },
              { label: 'Ratio',      value: aspectRatio },
              { label: 'Messages',   value: willTruncate ? `${exportedMessages} / ${totalMessages}` : `${totalMessages}` },
              { label: 'Theme',      value: themeId },
            ].map(({ label, value }) => (
              <div key={label} className="bg-zinc-800 rounded-xl p-3">
                <p className="text-[10px] text-zinc-500 mb-0.5 uppercase tracking-wide">{label}</p>
                <p className={`text-sm font-semibold capitalize ${label === 'Messages' && willTruncate ? 'text-amber-400' : 'text-white'}`}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* ── Free-plan upgrade CTA (only when no truncation / watermark shown separately) ── */}
          {isFree && !willTruncate && (
            <div className="rounded-xl border border-dashed border-zinc-700 p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-zinc-300">Want more?</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">Unlimited messages, no watermark, priority support.</p>
              </div>
              <Link
                href="/pricing"
                className="shrink-0 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
              >
                See plans
              </Link>
            </div>
          )}

          {/* ── Error ── */}
          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3">
              <p className="text-xs text-red-400 font-medium mb-1">Render error</p>
              <p className="text-xs text-red-300/70 font-mono break-all">{error}</p>
            </div>
          )}

          {/* ── Success ── */}
          {videoUrl && (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 space-y-3">
              <p className="text-sm text-emerald-400 font-semibold">✓ Video ready!</p>
              <div className="flex items-center gap-1.5 bg-zinc-800 rounded-lg px-3 py-2">
                <span className="flex-1 text-xs text-zinc-400 truncate font-mono">{videoUrl}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleDownload}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  ⬇ Download
                </button>
                <button
                  onClick={handleCopy}
                  className="flex-1 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  {copied ? '✓ Copied!' : '🔗 Copy link'}
                </button>
              </div>
            </div>
          )}

          {/* ── Progress ── */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Rendering…</span>
                <span>{exportProgress}%</span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center gap-3 px-5 pb-5">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            {videoUrl ? 'Close' : 'Cancel'}
          </Button>
          {!videoUrl && (
            <Button onClick={handleExport} loading={isExporting} className="flex-1">
              {isExporting ? 'Rendering…' : `Export ${exportedMessages} message${exportedMessages !== 1 ? 's' : ''}`}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
