/**
 * Synthesized chat audio — no audio files required.
 * All sounds generated in real-time via Web Audio API.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    try {
      ctx = new AudioContext();
    } catch {
      return null;
    }
  }
  // Resume if suspended (browser autoplay policy)
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function masterGain(audioCtx: AudioContext, volume: number): GainNode {
  const g = audioCtx.createGain();
  g.gain.value = volume;
  g.connect(audioCtx.destination);
  return g;
}

// ---------------------------------------------------------------------------
// Sound primitives
// ---------------------------------------------------------------------------

/** Very quiet mechanical click — single typing keystroke. */
function playClick(audioCtx: AudioContext, t: number, volume = 0.06) {
  const buf = audioCtx.createBuffer(1, Math.floor(audioCtx.sampleRate * 0.025), audioCtx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    // White-noise burst with fast envelope
    const env = 1 - i / data.length;
    data[i] = (Math.random() * 2 - 1) * env * env;
  }
  const src = audioCtx.createBufferSource();
  src.buffer = buf;
  const g = audioCtx.createGain();
  g.gain.value = volume;
  // Highpass filter to keep it light
  const hp = audioCtx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 3000;
  src.connect(hp);
  hp.connect(g);
  g.connect(audioCtx.destination);
  src.start(t);
}

/** Descending swoosh — "message sent" sound (like WhatsApp). */
function playSend(audioCtx: AudioContext) {
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const g   = audioCtx.createGain();
  osc.connect(g);
  g.connect(audioCtx.destination);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(900, t);
  osc.frequency.exponentialRampToValueAtTime(420, t + 0.18);

  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.22, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

  osc.start(t);
  osc.stop(t + 0.25);
}

/** Two-note ascending ping — "message received" notification. */
function playReceive(audioCtx: AudioContext) {
  const t = audioCtx.currentTime;
  [{ freq: 820, delay: 0 }, { freq: 1060, delay: 0.13 }].forEach(({ freq, delay }) => {
    const osc = audioCtx.createOscillator();
    const g   = audioCtx.createGain();
    osc.connect(g);
    g.connect(audioCtx.destination);

    osc.type = 'sine';
    osc.frequency.value = freq;

    g.gain.setValueAtTime(0, t + delay);
    g.gain.linearRampToValueAtTime(0.18, t + delay + 0.015);
    g.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.32);

    osc.start(t + delay);
    osc.stop(t + delay + 0.38);
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export type SoundType = 'send' | 'receive' | 'typing';

export function playSound(type: SoundType): void {
  const audioCtx = getCtx();
  if (!audioCtx) return;

  try {
    switch (type) {
      case 'send':    return playSend(audioCtx);
      case 'receive': return playReceive(audioCtx);
      case 'typing':  return playClick(audioCtx, audioCtx.currentTime, 0.04);
    }
  } catch {
    // Silently ignore any audio errors
  }
}
