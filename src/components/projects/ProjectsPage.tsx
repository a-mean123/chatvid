'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface User {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  plan?: string | null;
  role?: string | null;
}

interface Project {
  id: string;
  name: string;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function SignInWall() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSignIn = (provider: string) => {
    setLoading(provider);
    signIn(provider, { callbackUrl: '/projects' });
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-12">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <span className="text-sm font-bold text-white">CV</span>
        </div>
        <span className="font-bold text-white text-lg">ChatVid</span>
      </Link>

      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-xl font-bold text-white text-center mb-2">Sign in to continue</h1>
        <p className="text-sm text-zinc-400 text-center mb-8">
          Create and save your chat video projects
        </p>

        <div className="space-y-3">
          <button
            onClick={() => handleSignIn('google')}
            disabled={!!loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-zinc-100 text-zinc-900 text-sm font-medium rounded-xl transition-colors disabled:opacity-60"
          >
            {loading === 'google' ? (
              <span className="w-5 h-5 border-2 border-zinc-400 border-t-zinc-900 rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continue with Google
          </button>

          <button
            onClick={() => handleSignIn('github')}
            disabled={!!loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-60"
          >
            {loading === 'github' ? (
              <span className="w-5 h-5 border-2 border-zinc-500 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
              </svg>
            )}
            Continue with GitHub
          </button>
        </div>
      </div>

      <p className="mt-6 text-xs text-zinc-600 text-center">
        By signing in you agree to our terms of service.
      </p>
    </div>
  );
}

export function ProjectsPage({ user }: { user: User | null }) {
  const router  = useRouter();
  const [projects,    setProjects]    = useState<Project[] | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [creating,    setCreating]    = useState(false);
  const [deletingId,  setDeletingId]  = useState<string | null>(null);
  const [newName,     setNewName]     = useState('');
  const [showNew,     setShowNew]     = useState(false);
  const [renamingId,  setRenamingId]  = useState<string | null>(null);
  const [renameVal,   setRenameVal]   = useState('');
  const [limitError,  setLimitError]  = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    fetch('/api/projects')
      .then((r) => r.json())
      .then((data) => setProjects(Array.isArray(data) ? data : []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (showNew) inputRef.current?.focus();
  }, [showNew]);

  if (!user) return <SignInWall />;

  const handleCreate = async () => {
    const name = newName.trim() || 'Untitled Project';
    setCreating(true);
    setLimitError('');
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, script: '', settings: {}, messages: [] }),
      });
      if (res.status === 403) {
        const data = await res.json();
        setLimitError(data.error ?? 'Project limit reached.');
        setShowNew(false);
        return;
      }
      const project = await res.json();
      router.push(`/editor?projectId=${project.id}`);
    } finally {
      setCreating(false);
    }
  };

  const handleOpen = (id: string) => router.push(`/editor?projectId=${id}`);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);
    await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    setProjects((prev) => prev?.filter((p) => p.id !== id) ?? null);
    setDeletingId(null);
  };

  const startRename = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setRenamingId(project.id);
    setRenameVal(project.name);
  };

  const commitRename = async (id: string) => {
    const name = renameVal.trim();
    if (!name) { setRenamingId(null); return; }
    setProjects((prev) => prev?.map((p) => p.id === id ? { ...p, name } : p) ?? null);
    setRenamingId(null);
    await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-xs font-bold text-white">CV</span>
            </div>
            <span className="font-bold text-white text-sm">ChatVid</span>
          </Link>

          <div className="flex items-center gap-3">
            {user.image && (
              <img src={user.image} alt={user.name ?? ''} className="w-8 h-8 rounded-full border border-zinc-700" />
            )}
            <span className="text-sm text-zinc-400 hidden sm:block">{user.name}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-xs text-zinc-500 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-zinc-800"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        {/* Title row */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">My Projects</h1>
              {user?.plan && (
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                  user.plan === 'pro'      ? 'bg-indigo-600/25 text-indigo-300 border border-indigo-500/30' :
                  user.plan === 'business' ? 'bg-purple-600/25 text-purple-300 border border-purple-500/30' :
                                             'bg-zinc-700 text-zinc-400'
                }`}>
                  {user.plan}
                </span>
              )}
            </div>
            <p className="text-sm text-zinc-500 mt-1">
              {projects ? `${projects.length} project${projects.length !== 1 ? 's' : ''}` : ''}
            </p>
          </div>

          <button
            onClick={() => { setLimitError(''); setShowNew(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <span className="text-base leading-none">+</span>
            New Project
          </button>
        </div>

        {/* Project limit banner */}
        {limitError && (
          <div className="mb-6 flex items-center justify-between gap-4 bg-amber-500/10 border border-amber-500/25 rounded-xl px-5 py-3.5">
            <div className="flex items-center gap-3">
              <span className="text-amber-400 text-lg">⚠️</span>
              <p className="text-sm text-amber-300">{limitError}</p>
            </div>
            <Link
              href="/pricing"
              className="shrink-0 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Upgrade →
            </Link>
          </div>
        )}

        {/* New project form */}
        {showNew && (
          <div className="mb-6 bg-zinc-900 border border-zinc-700 rounded-2xl p-5">
            <p className="text-sm font-medium text-zinc-300 mb-3">Project name</p>
            <div className="flex gap-3">
              <input
                ref={inputRef}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setShowNew(false); }}
                placeholder="My awesome chat video"
                className="flex-1 bg-zinc-800 border border-zinc-600 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none transition-colors"
              />
              <button
                onClick={handleCreate}
                disabled={creating}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                {creating ? 'Creating…' : 'Create'}
              </button>
              <button
                onClick={() => setShowNew(false)}
                className="px-3 py-2.5 text-zinc-400 hover:text-white text-sm rounded-xl hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Project grid */}
        {loading ? (
          <div className="text-center py-20 text-zinc-600 text-sm">Loading projects…</div>
        ) : projects?.length === 0 ? (
          <div className="text-center py-24 space-y-4">
            <div className="text-5xl">🎬</div>
            <p className="text-zinc-400 font-medium">No projects yet</p>
            <p className="text-zinc-600 text-sm">Create your first project to get started</p>
            <button
              onClick={() => setShowNew(true)}
              className="mt-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              + New Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects?.map((project) => (
              <div
                key={project.id}
                onClick={() => handleOpen(project.id)}
                className="group relative bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 cursor-pointer transition-all"
              >
                {/* Thumbnail */}
                <div className="w-full h-32 rounded-xl bg-zinc-800 group-hover:bg-zinc-700/50 flex items-center justify-center mb-4 transition-colors text-4xl">
                  💬
                </div>

                {/* Name */}
                {renamingId === project.id ? (
                  <input
                    autoFocus
                    value={renameVal}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setRenameVal(e.target.value)}
                    onBlur={() => commitRename(project.id)}
                    onKeyDown={(e) => { if (e.key === 'Enter') commitRename(project.id); if (e.key === 'Escape') setRenamingId(null); }}
                    className="w-full bg-zinc-700 border border-indigo-500 rounded-lg px-2 py-1 text-sm text-white outline-none mb-1"
                  />
                ) : (
                  <p className="text-sm font-semibold text-white truncate mb-1">{project.name}</p>
                )}

                <p className="text-xs text-zinc-500">Updated {timeAgo(project.updatedAt)}</p>

                {/* Actions */}
                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => startRename(e, project)}
                    className="p-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-400 hover:text-white text-xs transition-colors"
                    title="Rename"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, project.id)}
                    disabled={deletingId === project.id}
                    className={cn(
                      'p-1.5 rounded-lg text-xs transition-colors',
                      deletingId === project.id
                        ? 'bg-zinc-700 text-zinc-500'
                        : 'bg-zinc-700 hover:bg-red-500/20 text-zinc-400 hover:text-red-400'
                    )}
                    title="Delete"
                  >
                    {deletingId === project.id ? '…' : '🗑'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
