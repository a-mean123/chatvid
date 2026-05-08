'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface UserMenuProps {
  onSignIn:   () => void;
  onProjects: () => void;
}

export function UserMenu({ onSignIn }: UserMenuProps) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref  = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (status === 'loading') {
    return <div className="w-7 h-7 rounded-full bg-zinc-800 animate-pulse" />;
  }

  if (!session) {
    return (
      <button
        onClick={onSignIn}
        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors"
      >
        Sign in
      </button>
    );
  }

  const name     = session.user.name ?? session.user.email ?? 'User';
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 p-1 rounded-xl hover:bg-zinc-800 transition-colors"
      >
        {session.user.image ? (
          <img src={session.user.image} alt={name} className="w-7 h-7 rounded-full object-cover" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-[11px] font-bold text-white">
            {initials}
          </div>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-52 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800">
            <p className="text-sm font-medium text-white truncate">{name}</p>
            <p className="text-[11px] text-zinc-500 truncate">{session.user.email}</p>
            {session.user.plan && (
              <div className="mt-2 flex items-center gap-2">
                <span className={cn(
                  'text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize',
                  session.user.plan === 'pro'      ? 'bg-indigo-600/25 text-indigo-300 border border-indigo-500/30' :
                  session.user.plan === 'business' ? 'bg-purple-600/25 text-purple-300 border border-purple-500/30' :
                                                     'bg-zinc-700 text-zinc-400'
                )}>
                  {session.user.plan} plan
                </span>
                {session.user.plan === 'free' && (
                  <a
                    href="/pricing"
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-2"
                    onClick={() => setOpen(false)}
                  >
                    Upgrade
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="p-1.5 space-y-0.5">
            <MenuItem icon="📁" label="My Projects" onClick={() => { setOpen(false); router.push('/projects'); }} />
            <MenuItem icon="💎" label="Pricing & Plans" onClick={() => { setOpen(false); router.push('/pricing'); }} />
            {session.user.role === 'admin' && (
              <MenuItem icon="⚙️" label="Admin Dashboard" onClick={() => { setOpen(false); router.push('/admin'); }} />
            )}
            <div className="h-px bg-zinc-800 my-1" />
            <MenuItem
              icon="🚪"
              label="Sign out"
              className="text-zinc-400"
              onClick={() => { setOpen(false); signOut({ callbackUrl: '/' }); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  icon, label, onClick, className,
}: { icon: string; label: string; onClick: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-zinc-300 hover:bg-zinc-800 transition-colors text-left',
        className
      )}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
