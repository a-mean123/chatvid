'use client';

import type { ChatTheme } from '@/types';

const ROW1 = ['Q','W','E','R','T','Y','U','I','O','P'];
const ROW2 = ['A','S','D','F','G','H','J','K','L'];
const ROW3_MID = ['Z','X','C','V','B','N','M'];

interface KeyboardProps {
  theme: ChatTheme;
  isDark: boolean;
  width: number;
}

export function Keyboard({ isDark, width }: KeyboardProps) {
  const scale = width / 390;
  const keyH  = Math.round(42 * scale);
  const gap   = Math.round(6 * scale);
  const r     = Math.round(5 * scale);
  const fs    = Math.round(16 * scale);
  const sfs   = Math.round(13 * scale);

  const keyBg     = isDark ? '#3a3a3c' : '#ffffff';
  const specBg    = isDark ? '#636366' : '#adb5bd';
  const keyText   = isDark ? '#ffffff' : '#000000';
  const barBg     = isDark ? '#1c1c1e' : '#d1d5db';
  const shadow    = isDark ? 'none' : '0 1px 0 rgba(0,0,0,0.3)';
  const padH      = Math.round(3 * scale);
  const padV      = Math.round(8 * scale);
  const row2Pad   = Math.round(20 * scale);

  function Key({ label, flex = 1, spec = false }: { label: string; flex?: number; spec?: boolean }) {
    return (
      <div style={{
        flex,
        height: keyH,
        backgroundColor: spec ? specBg : keyBg,
        borderRadius: r,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: spec ? sfs : fs,
        color: keyText,
        fontWeight: spec ? 400 : 500,
        boxShadow: shadow,
        userSelect: 'none',
        cursor: 'default',
      }}>
        {label}
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: barBg,
      padding: `${padV}px ${padH}px ${Math.round(20 * scale)}px`,
      display: 'flex',
      flexDirection: 'column',
      gap,
    }}>
      {/* Row 1 */}
      <div style={{ display: 'flex', gap }}>
        {ROW1.map((k) => <Key key={k} label={k} />)}
      </div>

      {/* Row 2 — padded to appear centered */}
      <div style={{ display: 'flex', gap, paddingLeft: row2Pad, paddingRight: row2Pad }}>
        {ROW2.map((k) => <Key key={k} label={k} />)}
      </div>

      {/* Row 3 — shift ⇧ and ⌫ */}
      <div style={{ display: 'flex', gap }}>
        <Key label="⇧" flex={1.4} spec />
        <div style={{ flex: 0.2 }} />
        {ROW3_MID.map((k) => <Key key={k} label={k} />)}
        <div style={{ flex: 0.2 }} />
        <Key label="⌫" flex={1.4} spec />
      </div>

      {/* Row 4 */}
      <div style={{ display: 'flex', gap }}>
        <Key label="123" flex={2} spec />
        <Key label="" flex={5} />
        <Key label="return" flex={2.5} spec />
      </div>
    </div>
  );
}
