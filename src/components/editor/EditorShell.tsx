'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Navbar } from '@/components/ui/Navbar';
import { SettingsSidebar } from '@/components/ui/SettingsSidebar';
import { ScriptEditor } from '@/components/editor/ScriptEditor';
import { PhoneFrame } from '@/components/chat/PhoneFrame';
import { ExportPanel } from '@/components/video/ExportPanel';
import { SignInModal } from '@/components/ui/SignInModal';
import { useChatStore } from '@/store/useChatStore';

type SaveStatus = 'idle' | 'unsaved' | 'saving' | 'saved';

interface Props {
  projectId?: string;
}

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

export function EditorShell({ projectId }: Props) {
  const [showExport,    setShowExport]    = useState(false);
  const [showSignIn,    setShowSignIn]    = useState(false);
  const [signInReason,  setSignInReason]  = useState<string | undefined>();
  const [projectName,   setProjectName]   = useState('');
  const [saveStatus,    setSaveStatus]    = useState<SaveStatus>('idle');

  const projectNameRef = useRef(projectName);
  projectNameRef.current = projectName;

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const loadProject = useChatStore((s) => s.loadProject);

  // Load project from API on mount
  useEffect(() => {
    if (!projectId) return;
    fetch(`/api/projects/${projectId}`)
      .then((r) => r.json())
      .then((data) => {
        loadProject(data);
        setProjectName(data.name ?? 'Untitled');
        setSaveStatus('saved');
      });
  }, [projectId, loadProject]);

  // Auto-save: subscribe to any store change, debounce 2 s
  const doSave = useCallback(async () => {
    if (!projectId) return;
    setSaveStatus('saving');
    try {
      await saveProject(projectId, projectNameRef.current || 'Untitled');
      setSaveStatus('saved');
    } catch {
      setSaveStatus('unsaved');
    }
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;
    const unsub = useChatStore.subscribe(() => {
      clearTimeout(saveTimerRef.current);
      setSaveStatus('unsaved');
      saveTimerRef.current = setTimeout(doSave, 2000);
    });
    return () => {
      unsub();
      clearTimeout(saveTimerRef.current);
    };
  }, [projectId, doSave]);

  const openSignIn = (reason?: string) => {
    setSignInReason(reason);
    setShowSignIn(true);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-zinc-950">
      <Navbar
        onExport={() => setShowExport(true)}
        onSignIn={() => openSignIn()}
        projectName={projectName}
        saveStatus={projectId ? saveStatus : undefined}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="w-72 xl:w-80 shrink-0 overflow-hidden">
          <ScriptEditor />
        </div>

        <div className="flex-1 overflow-hidden bg-zinc-950 flex items-center justify-center relative">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
          <div className="relative z-10 flex items-center justify-center w-full h-full p-6">
            <PhoneFrame />
          </div>
        </div>

        <SettingsSidebar />
      </div>

      {showExport && <ExportPanel onClose={() => setShowExport(false)} />}
      {showSignIn && <SignInModal onClose={() => setShowSignIn(false)} reason={signInReason} />}
    </div>
  );
}
