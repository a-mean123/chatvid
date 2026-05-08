'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Navbar } from '@/components/ui/Navbar';
import { SettingsSidebar } from '@/components/ui/SettingsSidebar';
import { ScriptEditor } from '@/components/editor/ScriptEditor';
import { PhoneFrame } from '@/components/chat/PhoneFrame';
import { ExportPanel } from '@/components/video/ExportPanel';
import { SignInModal } from '@/components/ui/SignInModal';
import { useChatStore } from '@/store/useChatStore';

type SaveStatus  = 'idle' | 'unsaved' | 'saving' | 'saved';
type MobileTab   = 'script' | 'preview' | 'settings';

interface Props { projectId?: string }

async function saveProject(projectId: string, name: string) {
  const s = useChatStore.getState();
  const settings = {
    themeId: s.themeId, isDark: s.isDark, aspectRatio: s.aspectRatio,
    animationSpeed: s.animationSpeed, contactName: s.contactName,
    contactStatus: s.contactStatus, meAlias: s.meAlias,
    conversationTime: s.conversationTime, timeFormat: s.timeFormat,
    showMeTypingInInput: s.showMeTypingInInput, showKeyboard: s.showKeyboard,
    autoStepTime: s.autoStepTime, chatBgColor: s.chatBgColor,
    chatBgImage: s.chatBgImage, characters: s.characters,
  };
  await fetch(`/api/projects/${projectId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, script: s.script, settings, messages: s.messages }),
  });
}

const MOBILE_TABS: { id: MobileTab; label: string; icon: string }[] = [
  { id: 'script',   label: 'Script',   icon: '✏️' },
  { id: 'preview',  label: 'Preview',  icon: '📱' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export function EditorShell({ projectId }: Props) {
  const [showExport,   setShowExport]   = useState(false);
  const [showSignIn,   setShowSignIn]   = useState(false);
  const [signInReason, setSignInReason] = useState<string | undefined>();
  const [projectName,  setProjectName]  = useState('');
  const [saveStatus,   setSaveStatus]   = useState<SaveStatus>('idle');
  const [mobileTab,    setMobileTab]    = useState<MobileTab>('preview');

  const projectNameRef = useRef(projectName);
  projectNameRef.current = projectName;
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const loadProject  = useChatStore((s) => s.loadProject);

  useEffect(() => {
    if (!projectId) return;
    fetch(`/api/projects/${projectId}`)
      .then((r) => r.json())
      .then((data) => { loadProject(data); setProjectName(data.name ?? 'Untitled'); setSaveStatus('saved'); });
  }, [projectId, loadProject]);

  const doSave = useCallback(async () => {
    if (!projectId) return;
    setSaveStatus('saving');
    try { await saveProject(projectId, projectNameRef.current || 'Untitled'); setSaveStatus('saved'); }
    catch { setSaveStatus('unsaved'); }
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;
    const unsub = useChatStore.subscribe(() => {
      clearTimeout(saveTimerRef.current);
      setSaveStatus('unsaved');
      saveTimerRef.current = setTimeout(doSave, 2000);
    });
    return () => { unsub(); clearTimeout(saveTimerRef.current); };
  }, [projectId, doSave]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-zinc-950">
      <Navbar
        onExport={() => setShowExport(true)}
        onSignIn={() => { setSignInReason(undefined); setShowSignIn(true); }}
        projectName={projectName}
        saveStatus={projectId ? saveStatus : undefined}
      />

      {/* ── Desktop: 3-column | Mobile: single panel ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Script editor */}
        <div className={`
          w-full md:w-72 xl:w-80 shrink-0 overflow-hidden
          ${mobileTab === 'script' ? 'flex' : 'hidden'} md:flex flex-col
        `}>
          <ScriptEditor />
        </div>

        {/* Phone preview */}
        <div className={`
          flex-1 overflow-hidden bg-zinc-950 relative
          ${mobileTab === 'preview' ? 'flex' : 'hidden'} md:flex items-center justify-center
        `}>
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
          <div className="relative z-10 flex items-center justify-center w-full h-full p-2 sm:p-4 md:p-6">
            <PhoneFrame />
          </div>
        </div>

        {/* Settings sidebar */}
        <div className={`
          w-full md:w-52 shrink-0 overflow-hidden
          ${mobileTab === 'settings' ? 'flex' : 'hidden'} md:flex flex-col
        `}>
          <SettingsSidebar />
        </div>
      </div>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="md:hidden flex border-t border-zinc-800 bg-zinc-900 shrink-0 pb-safe">
        {MOBILE_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMobileTab(tab.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${
              mobileTab === tab.id ? 'text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span className="text-base leading-none">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {showExport && <ExportPanel onClose={() => setShowExport(false)} />}
      {showSignIn && <SignInModal onClose={() => setShowSignIn(false)} reason={signInReason} />}
    </div>
  );
}
