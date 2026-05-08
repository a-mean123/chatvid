import Link from 'next/link';
import { LandingNav } from '@/components/landing/LandingNav';

// â”€â”€ Static chat bubble preview â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ChatBubble({ text, isMe, time }: { text: string; isMe: boolean; time: string }) {
  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1.5`}>
      <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
        isMe ? 'bg-[#005c4b] text-white rounded-br-sm' : 'bg-[#202c33] text-[#e9edef] rounded-bl-sm'
      }`}>
        <p>{text}</p>
        <p className={`text-[10px] mt-0.5 ${isMe ? 'text-[#8db4a8] text-right' : 'text-[#8db4a8]'}`}>{time}</p>
      </div>
    </div>
  );
}

function PhoneMockup() {
  return (
    <div className="relative mx-auto" style={{ width: 220 }}>
      {/* Phone shell */}
      <div className="relative bg-zinc-900 rounded-[2.5rem] border-4 border-zinc-700 shadow-2xl overflow-hidden" style={{ height: 420 }}>
        {/* Status bar */}
        <div className="bg-[#1f2c34] px-4 py-1.5 flex items-center justify-between">
          <span className="text-[9px] text-white font-semibold">9:41</span>
          <div className="flex items-center gap-1 text-[9px] text-white opacity-70">
            <span>â—â—â—</span><span>WiFi</span><span>ðŸ”‹</span>
          </div>
        </div>
        {/* Chat header */}
        <div className="bg-[#1f2c34] px-3 py-2 flex items-center gap-2 border-b border-white/5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">A</div>
          <div>
            <p className="text-white text-[11px] font-semibold">Alex</p>
            <p className="text-[#8db4a8] text-[9px]">online</p>
          </div>
        </div>
        {/* Messages */}
        <div className="bg-[#0b141a] flex-1 px-3 py-2" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
          <ChatBubble text="hey did you see that new coding tutorial?" isMe={false} time="13:01" />
          <ChatBubble text="which one? ðŸ˜…" isMe={true} time="13:02" />
          <ChatBubble text="the one about building a SaaS in 1 hour" isMe={false} time="13:02" />
          <ChatBubble text="bro that's actually fire ðŸ”¥" isMe={true} time="13:03" />
          <ChatBubble text="we should build one together" isMe={false} time="13:03" />
          <ChatBubble text="let's do it! ðŸ’¯" isMe={true} time="13:04" />
        </div>
        {/* Input bar */}
        <div className="bg-[#1f2c34] px-3 py-2 flex items-center gap-2">
          <div className="flex-1 bg-[#2a3942] rounded-full px-3 py-1.5 text-[9px] text-[#8db4a8]">Message</div>
          <div className="w-6 h-6 rounded-full bg-[#00a884] flex items-center justify-center text-[10px]">ðŸŽ¤</div>
        </div>
      </div>
      {/* Glow */}
      <div className="absolute inset-0 rounded-[2.5rem] bg-indigo-500/10 blur-xl -z-10 scale-110" />
    </div>
  );
}

// â”€â”€ Feature card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-white font-semibold mb-2">{title}</h3>
      <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

// â”€â”€ Theme card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ThemeCard({ icon, name, bg, accent, desc }: { icon: string; name: string; bg: string; accent: string; desc: string }) {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/5 group">
      <div className={`${bg} p-5 h-36 flex flex-col justify-between`}>
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="text-white font-semibold text-sm">{name}</span>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-start">
            <div className={`${accent} rounded-2xl rounded-bl-sm px-3 py-1.5 text-white text-xs max-w-[70%]`}>Hey! How are you?</div>
          </div>
          <div className="flex justify-end">
            <div className="bg-white/15 rounded-2xl rounded-br-sm px-3 py-1.5 text-white text-xs max-w-[70%]">I'm great, thanks!</div>
          </div>
        </div>
      </div>
      <div className="bg-zinc-900 px-4 py-2.5 border-t border-white/5">
        <p className="text-zinc-500 text-xs">{desc}</p>
      </div>
    </div>
  );
}

// â”€â”€ Step card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function Step({ n, icon, title, desc }: { n: number; icon: string; title: string; desc: string }) {
  return (
    <div className="flex gap-5">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-sm shrink-0">
          {n}
        </div>
        {n < 3 && <div className="w-px flex-1 bg-zinc-800 mt-3" />}
      </div>
      <div className="pb-10">
        <div className="text-2xl mb-2">{icon}</div>
        <h3 className="text-white font-semibold mb-1">{title}</h3>
        <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// â”€â”€ Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden">
      <LandingNav />

      {/* â”€â”€ Hero â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="relative min-h-screen flex items-center pt-14">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-zinc-950 to-purple-950/20 pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-8 text-sm text-indigo-300">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse inline-block" />
              Free to use Â· No design skills needed
            </div>

            <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.1] tracking-tight mb-6">
              Turn chats into
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                viral videos
              </span>
            </h1>

            <p className="text-xl text-zinc-400 leading-relaxed mb-10 max-w-lg">
              Create realistic animated chat conversations for TikTok, Reels & Shorts â€” in under a minute.
              WhatsApp, iMessage, Instagram & Telegram styles.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5"
              >
                Start creating â€” free
                <span>â†’</span>
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-xl transition-all border border-zinc-700 hover:border-zinc-600"
              >
                See how it works
              </a>
            </div>

            {/* Social proof pills */}
            <div className="flex flex-wrap gap-3 mt-10 text-xs text-zinc-500">
              {['4 realistic themes', '3 aspect ratios', 'RTL language support', 'Emoji reactions', 'HD MP4 export'].map((f) => (
                <span key={f} className="flex items-center gap-1.5">
                  <span className="text-indigo-500">âœ“</span> {f}
                </span>
              ))}
            </div>
          </div>

          {/* Right â€” phone mockup */}
          <div className="flex items-center justify-center">
            <PhoneMockup />
          </div>
        </div>
      </section>

      {/* â”€â”€ How it works â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section id="how-it-works" className="py-28 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-4">How it works</p>
            <h2 className="text-4xl font-bold text-white mb-6">
              Three steps to your
              <br />
              next viral video
            </h2>
            <p className="text-zinc-500 leading-relaxed">
              No timeline editing, no complex software. Just write your conversation, pick a style, and export.
            </p>
          </div>

          <div>
            <Step
              n={1}
              icon="âœï¸"
              title="Write your script"
              desc="Type your conversation in plain text â€” Name: message. Add images, system messages, emoji reactions."
            />
            <Step
              n={2}
              icon="ðŸ‘ï¸"
              title="Preview in real time"
              desc="Watch your chat animate live in the editor. Adjust theme, speed, aspect ratio, background and more."
            />
            <Step
              n={3}
              icon="â¬‡ï¸"
              title="Export as MP4"
              desc="Render a crisp HD video ready to upload directly to TikTok, Instagram Reels, or YouTube Shorts."
            />
          </div>
        </div>
      </section>

      {/* â”€â”€ Themes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section id="themes" className="py-28 px-6 bg-zinc-900/40 border-y border-zinc-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-4">Themes</p>
            <h2 className="text-4xl font-bold text-white mb-4">4 realistic chat styles</h2>
            <p className="text-zinc-500 max-w-xl mx-auto">
              Every pixel matches the real app â€” your audience won't be able to tell the difference.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ThemeCard icon="ðŸ’¬" name="WhatsApp"  bg="bg-[#0b141a]" accent="bg-[#005c4b]" desc="The world's most recognized chat UI" />
            <ThemeCard icon="ðŸ’¬" name="iMessage"  bg="bg-[#1c1c1e]" accent="bg-[#2b7fff]" desc="Apple's signature blue bubble style" />
            <ThemeCard icon="ðŸ“¸" name="Instagram" bg="bg-gradient-to-br from-purple-950 to-pink-950" accent="bg-[#3797f0]" desc="DM style with gradient accents" />
            <ThemeCard icon="âœˆï¸" name="Telegram"  bg="bg-[#17212b]" accent="bg-[#2b5278]" desc="Clean and minimal messaging style" />
          </div>
        </div>
      </section>

      {/* â”€â”€ Features â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section id="features" className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-4">Features</p>
            <h2 className="text-4xl font-bold text-white mb-4">Everything you need</h2>
            <p className="text-zinc-500 max-w-xl mx-auto">
              Packed with details that make your videos look genuinely authentic.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard icon="ðŸŽ¬" title="Animated typing" desc="Realistic typing indicators, read receipts, and message reveal animations for every theme." />
            <FeatureCard icon="ðŸŒ" title="RTL language support" desc="Arabic, Hebrew, and other right-to-left languages display perfectly in every bubble." />
            <FeatureCard icon="ðŸ˜" title="Emoji reactions" desc="Add WhatsApp-style reactions to any message. They show in both preview and exported video." />
            <FeatureCard icon="ðŸ–¼ï¸" title="Image messages" desc="Drop any image URL into your script. Images appear inside chat bubbles just like the real app." />
            <FeatureCard icon="ðŸŽ¨" title="Custom backgrounds" desc="Choose a color, pick from presets, or use your own image as the chat background." />
            <FeatureCard icon="ðŸ“" title="3 aspect ratios" desc="9:16 for TikTok & Reels, 1:1 for feed posts, 16:9 for YouTube â€” switch instantly." />
            <FeatureCard icon="âŒ¨ï¸" title="Keyboard animation" desc="Show the iOS keyboard sliding up when 'Me' is typing for extra realism." />
            <FeatureCard icon="ðŸ’¾" title="Save your projects" desc="Sign in to save unlimited projects and pick up exactly where you left off." />
            <FeatureCard icon="âš¡" title="Adjustable speed" desc="Control how fast messages appear. Perfect for short punchy clips or longer storytelling." />
          </div>
        </div>
      </section>

      {/* â”€â”€ CTA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative bg-gradient-to-br from-indigo-950/60 to-purple-950/40 border border-indigo-500/20 rounded-3xl p-16 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-purple-600/5 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
                Ready to go viral?
              </h2>
              <p className="text-zinc-400 text-lg mb-10 max-w-md mx-auto">
                Join creators using ChatVid to make engaging, realistic chat videos in minutes.
              </p>
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-lg transition-all hover:shadow-2xl hover:shadow-indigo-500/30 hover:-translate-y-0.5"
              >
                Start creating â€” it's free â†’
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* â”€â”€ Footer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <footer className="border-t border-zinc-800/50 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-[9px] font-bold text-white">CV</span>
            </div>
            <span className="text-sm font-semibold text-zinc-400">ChatVid</span>
          </div>
          <p className="text-xs text-zinc-600">Â© {new Date().getFullYear()} ChatVid. All rights reserved.</p>
          <Link href="/projects" className="text-sm text-zinc-500 hover:text-white transition-colors">
            Open Editor â†’
          </Link>
        </div>
      </footer>
    </div>
  );
}
