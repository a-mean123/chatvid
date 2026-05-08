'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

export function LandingNav() {
  const { data: session } = useSession();

  return (
    <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <span className="text-xs font-bold text-white">CV</span>
          </div>
          <span className="font-bold text-white text-sm">ChatVid</span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-6 text-sm text-zinc-400">
          <a href="#features"     className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
          <a href="#themes"       className="hover:text-white transition-colors">Themes</a>
          <Link href="/pricing"   className="hover:text-white transition-colors">Pricing</Link>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          {session ? (
            <Link
              href="/projects"
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              My Projects →
            </Link>
          ) : (
            <>
              <Link
                href="/projects"
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/projects"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Try for free
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
