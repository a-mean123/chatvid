'use client';

import { useEffect, useState } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { cn } from '@/lib/utils';

interface Project {
  id: string;
  name: string;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface ProjectsPanelProps {
  onClose: () => void;
  onSignInRequired: () => void;
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

export function ProjectsPanel({ onClose, onSignInRequired }: ProjectsPanelProps) {
  const { script, messages, themeId, isDark, aspectRatio, animationSpeed,
          contactName, contactStatus, meAlias, conversationTime, timeFormat,
          showMeTypingInInput, showKeyboard, autoStepTime, chatBgColor, chatBgImage,
          characters, setScript, setMeAlias, setContactName, setContactStatus,
          setThemeId, toggleDark, setAspectRatio, setAnimationSpeed,
          setConversationTime, setTimeFormat, setChatBgColor, setChatBgImage } = useChatStore();

  const [projects, setProjects]   = useState<Project[] | null>(null);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saveName, setSaveName]   = useState('');
  const [showSave, setShowSave]   = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => {
        if (r.status === 401) { onSignInRequired(); onClose(); return null; }
        return r.json();
      })
      .then((data) => { if (data) setProjects(data); })
      .catch(() => setError('Failed to load projects'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    const settings = {
      themeId, isDark, aspectRatio, animationSpeed, contactName, contactStatus,
      meAlias, conversationTime, timeFormat, showMeTypingInInput, showKeyboard,
      autoStepTime, chatBgColor, chatBgImage, characters,
    };

    const payload = { name: saveName || 'Untitled Project', script, settings, messages };

    try {
      if (currentId) {
        await fetch(`/api/projects/${currentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        setProjects((prev) => prev?.map((p) => p.id === currentId ? { ...p, name: payload.name, updatedAt: new Date().toISOString() } : p) ?? null);
      } else {
        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const { error: msg } = await res.json();
          setError(msg ?? 'Failed to save');
          return;
        }
        const created = await res.json();
        setCurrentId(created.id);
        setProjects((prev) => [created, ...(prev ?? [])]);
      }
      setShowSave(false);
    } catch {
      setError('Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const handleLoad = async (project: Project) => {
    const res  = await fetch(`/api/projects/${project.id}`);
    const data = await res.json();

    setScript(data.script ?? '');

    const s = data.settings ?? {};
    if (s.meAlias)       setMeAlias(s.meAlias);
    if (s.contactName)   setContactName(s.contactName);
    if (s.contactStatus) setContactStatus(s.contactStatus);
    if (s.themeId)       setThemeId(s.themeId);
    if (s.aspectRatio)   setAspectRatio(s.aspectRatio);
    if (s.animationSpeed) setAnimationSpeed(s.animationSpeed);
    if (s.conversationTime) setConversationTime(s.conversationTime);
    if (s.timeFormat)    setTimeFormat(s.timeFormat);
    if (s.chatBgColor)   setChatBgColor(s.chatBgColor);
    if (s.chatBgImage)   setChatBgImage(s.chatBgImage);
    if (s.isDark !== undefined && s.isDark !== isDark) toggleDark();

    setCurrentId(project.id);
    setSaveName(project.name);
    onClose();
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    setProjects((prev) => prev?.filter((p) => p.id !== id) ?? null);
    if (currentId === id) setCurrentId(null);
    setDeletingId(null);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800 shrink-0">
          <h2 className="text-white font-semibold text-lg">Projects</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setSaveName(saveName || 'Untitled Project'); setShowSave(true); }}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              + Save current
            </button>
            <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">✕</button>
          </div>
        </div>

        {/* Save form */}
        {showSave && (
          <div className="px-5 py-3 border-b border-zinc-800 bg-zinc-800/40 space-y-2 shrink-0">
            <p className="text-xs text-zinc-400">Project name</p>
            <div className="flex gap-2">
              <input
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                autoFocus
                placeholder="My awesome chat"
                className="flex-1 bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? '…' : 'Save'}
              </button>
              <button onClick={() => setShowSave(false)} className="text-zinc-500 hover:text-white px-2">✕</button>
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>
        )}

        {/* Project list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading && (
            <div className="text-center text-zinc-500 text-sm py-12">Loading…</div>
          )}
          {!loading && projects?.length === 0 && (
            <div className="text-center text-zinc-600 text-sm py-12 space-y-2">
              <p className="text-2xl">📁</p>
              <p>No saved projects yet.</p>
              <p className="text-xs">Click "Save current" to save your work.</p>
            </div>
          )}
          {projects?.map((project) => (
            <div
              key={project.id}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl border transition-all group cursor-pointer',
                currentId === project.id
                  ? 'bg-indigo-500/10 border-indigo-500/30'
                  : 'bg-zinc-800 border-zinc-700/50 hover:border-zinc-600'
              )}
              onClick={() => handleLoad(project)}
            >
              <div className="w-10 h-10 rounded-lg bg-zinc-700 flex items-center justify-center text-xl shrink-0">
                💬
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{project.name}</p>
                <p className="text-[11px] text-zinc-500">Updated {timeAgo(project.updatedAt)}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }}
                disabled={deletingId === project.id}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all text-xs"
              >
                {deletingId === project.id ? '…' : '🗑'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
