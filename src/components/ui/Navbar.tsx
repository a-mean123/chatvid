'use client';

import Link from 'next/link';
import { useChatStore } from '@/store/useChatStore';
import { THEME_LIST } from '@/themes';
import { Button } from './Button';
import { UserMenu } from './UserMenu';
import { cn } from '@/lib/utils';
import type { ThemeId, AspectRatio } from '@/types';

const ASPECT_RATIOS: { id: AspectRatio; label: string }[] = [
  { id: '9:16', label: '9:16' },
  { id: '4:5',  label: '4:5'  },
  { id: '1:1',  label: '1:1'  },
  { id: '16:9', label: '16:9' },
];

const SAVE_LABELS: Record<string, string> = {
  saved:   '✓ Saved',
  saving:  'Saving…',
  unsaved: '● Unsaved',
  idle:    '',
};

const SAVE_COLORS: Record<string, string> = {
  saved:   'text-emerald-400',
  saving:  'text-zinc-400',
  unsaved: 'text-amber-400',
  idle:    '',
};

interface NavbarProps {
  onExport:     () => void;
  onSignIn:     () => void;
  projectName?: string;
  saveStatus?:  'idle' | 'unsaved' | 'saving' | 'saved';
}

export function Navbar({ onExport, onSignIn, projectName, saveStatus }: NavbarProps) {
  const { themeId, setThemeId, isDark, toggleDark, aspectRatio, setAspectRatio, isExporting } = useChatStore();

  return (
    <header className="bg-zinc-900 border-b border-zinc-800 shrink-0 z-50">
      <div className="flex items-center px-3 md:px-4 gap-2 md:gap-4 h-12 md:h-13">

        {/* Logo + project name */}
        <div className="flex items-center gap-2 min-w-0 shrink-0">
          <Link href="/projects" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-xs font-bold text-white">CV</span>
            </div>
            <span className="font-bold text-white text-sm hidden sm:block">ChatVid</span>
          </Link>

          {projectName && (
            <>
              <span className="text-zinc-600 text-sm hidden sm:block">/</span>
              <span className="text-zinc-300 text-sm font-medium truncate max-w-24 md:max-w-36 hidden sm:block">
                {projectName}
              </span>
            </>
          )}

          {saveStatus && saveStatus !== 'idle' && (
            <span className={cn('text-xs shrink-0 hidden sm:block', SAVE_COLORS[saveStatus])}>
              {SAVE_LABELS[saveStatus]}
            </span>
          )}
        </div>

        {/* ── Theme selector — hidden on small screens ── */}
        <div className="hidden md:flex items-center gap-1">
          <div className="h-5 w-px bg-zinc-700 mr-2" />
          {THEME_LIST.map((t) => (
            <button
              key={t.id}
              onClick={() => setThemeId(t.id as ThemeId)}
              title={t.name}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150',
                themeId === t.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              )}
            >
              <span className="mr-1">{t.icon}</span>
              <span className="hidden lg:inline">{t.name}</span>
            </button>
          ))}
        </div>

        {/* ── Aspect ratio — hidden on small screens ── */}
        <div className="hidden md:flex items-center gap-1">
          <div className="h-5 w-px bg-zinc-700 mr-2" />
          {ASPECT_RATIOS.map((r) => (
            <button
              key={r.id}
              onClick={() => setAspectRatio(r.id)}
              className={cn(
                'px-2 py-1 rounded-lg text-xs font-medium transition-all duration-150',
                aspectRatio === r.id
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
              )}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Dark mode */}
        <button
          onClick={toggleDark}
          className="text-zinc-400 hover:text-white transition-colors text-sm px-2 py-1 rounded-lg hover:bg-zinc-800"
          title="Toggle dark mode"
        >
          {isDark ? '☀️' : '🌙'}
        </button>

        <div className="h-5 w-px bg-zinc-700 shrink-0" />

        {/* Export */}
        <Button onClick={onExport} loading={isExporting} size="sm" className="gap-1 font-semibold">
          {!isExporting && <span className="hidden xs:inline">⬇ </span>}
          <span className="hidden sm:inline">{isExporting ? 'Rendering…' : 'Export MP4'}</span>
          <span className="sm:hidden">{isExporting ? '…' : 'Export'}</span>
        </Button>

        <div className="h-5 w-px bg-zinc-700 shrink-0" />

        {/* User */}
        <UserMenu onSignIn={onSignIn} onProjects={() => {}} />
      </div>

      {/* ── Mobile: theme + ratio row ── */}
      <div className="md:hidden flex items-center gap-1 px-3 pb-2 overflow-x-auto scrollbar-none">
        {THEME_LIST.map((t) => (
          <button
            key={t.id}
            onClick={() => setThemeId(t.id as ThemeId)}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0',
              themeId === t.id ? 'bg-indigo-600 text-white' : 'text-zinc-400 bg-zinc-800'
            )}
          >
            {t.icon} {t.name}
          </button>
        ))}
        <div className="w-px h-4 bg-zinc-700 shrink-0 mx-1" />
        {ASPECT_RATIOS.map((r) => (
          <button
            key={r.id}
            onClick={() => setAspectRatio(r.id)}
            className={cn(
              'px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0',
              aspectRatio === r.id ? 'bg-zinc-700 text-white' : 'text-zinc-500 bg-zinc-800'
            )}
          >
            {r.label}
          </button>
        ))}
      </div>
    </header>
  );
}
