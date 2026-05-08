'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { PLANS, type PlanId } from '@/lib/plans';
import { LandingNav } from '@/components/landing/LandingNav';

function CheckIcon({ checked }: { checked: boolean }) {
  if (checked) {
    return (
      <svg className="w-4 h-4 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4 text-zinc-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function SubscriptionModal({
  plan,
  onClose,
}: {
  plan: PlanId;
  onClose: () => void;
}) {
  const { data: session } = useSession();
  const [form, setForm] = useState({
    name:    session?.user?.name  ?? '',
    email:   session?.user?.email ?? '',
    company: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Request failed');
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  const planInfo = PLANS[plan];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {status === 'success' ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Request sent!</h3>
            <p className="text-zinc-400 text-sm mb-6">
              We'll review your {planInfo.name} plan request and activate your account within 24 hours.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-xs text-indigo-400 font-semibold uppercase tracking-widest mb-1">Subscribe to</p>
              <h3 className="text-2xl font-bold text-white">{planInfo.name} Plan</h3>
              <p className="text-zinc-500 text-sm mt-1">{planInfo.description}</p>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Full name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    placeholder="Alex Johnson"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    placeholder="alex@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Company <span className="text-zinc-600">(optional)</span></label>
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="Acme Inc."
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Message <span className="text-zinc-600">(optional)</span></label>
                <textarea
                  rows={3}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                  placeholder="Tell us about your use case..."
                />
              </div>

              {status === 'error' && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors text-sm"
              >
                {status === 'loading' ? 'Sending…' : `Request ${planInfo.name} plan`}
              </button>
            </form>

            <p className="text-center text-xs text-zinc-600 mt-4">
              We'll manually activate your account after reviewing. No card required.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function PlanCard({
  planId,
  onSelect,
  currentPlan,
}: {
  planId: PlanId;
  onSelect: (id: PlanId) => void;
  currentPlan?: string;
}) {
  const plan = PLANS[planId];
  const isHighlighted = plan.highlighted;
  const isCurrent = currentPlan === planId;

  return (
    <div className={`relative flex flex-col rounded-2xl p-8 border transition-all ${
      isHighlighted
        ? 'bg-indigo-950/40 border-indigo-500/40 shadow-2xl shadow-indigo-500/10'
        : 'bg-zinc-900 border-zinc-800'
    }`}>
      {isHighlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Most popular
          </span>
        </div>
      )}

      <div className="mb-6">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
          style={{ backgroundColor: `${plan.color}22`, border: `1px solid ${plan.color}44` }}
        >
          <span className="text-base font-bold" style={{ color: plan.color }}>
            {planId === 'free' ? 'F' : planId === 'pro' ? 'P' : 'B'}
          </span>
        </div>
        <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
        <p className="text-zinc-500 text-sm">{plan.description}</p>
      </div>

      <div className="mb-6">
        <span className="text-4xl font-extrabold text-white">{plan.price}</span>
        <span className="text-zinc-500 text-sm ml-1">{plan.period}</span>
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {plan.features.map((f) => (
          <li key={f.text} className="flex items-center gap-2.5">
            <CheckIcon checked={f.included} />
            <span className={`text-sm ${f.included ? 'text-zinc-300' : 'text-zinc-600'}`}>{f.text}</span>
          </li>
        ))}
      </ul>

      {planId === 'free' ? (
        <Link
          href="/projects"
          className="block text-center py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-xl transition-colors text-sm border border-zinc-700"
        >
          {isCurrent ? 'Current plan' : 'Get started free'}
        </Link>
      ) : isCurrent ? (
        <button
          disabled
          className="py-2.5 bg-zinc-800 text-zinc-500 font-semibold rounded-xl text-sm cursor-default border border-zinc-700"
        >
          Current plan
        </button>
      ) : (
        <button
          onClick={() => onSelect(planId)}
          className={`py-2.5 font-semibold rounded-xl transition-all text-sm ${
            isHighlighted
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-lg hover:shadow-indigo-500/25'
              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
          }`}
        >
          Get {plan.name}
        </button>
      )}
    </div>
  );
}

export function PricingPage() {
  const { data: session } = useSession();
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null);

  function handleSelect(planId: PlanId) {
    if (!session) {
      window.location.href = '/projects';
      return;
    }
    setSelectedPlan(planId);
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <LandingNav />

      <div className="pt-28 pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-4">Pricing</p>
            <h1 className="text-5xl font-extrabold text-white mb-4">Simple, transparent pricing</h1>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">
              Start free. Upgrade when you need more. All plans include every feature — no hidden limits.
            </p>
            {session?.user?.plan && session.user.plan !== 'free' && (
              <div className="mt-6 inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-2 text-sm text-indigo-300">
                <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
                You are on the <strong className="capitalize">{session.user.plan}</strong> plan
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['free', 'pro', 'business'] as PlanId[]).map((id) => (
              <PlanCard
                key={id}
                planId={id}
                onSelect={handleSelect}
                currentPlan={session?.user?.plan}
              />
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-zinc-500 text-sm mb-2">
              Subscriptions are activated manually — usually within 24 hours.
            </p>
            <p className="text-zinc-600 text-xs">
              Questions? Contact us at{' '}
              <a href="mailto:support@chatvid.app" className="text-zinc-400 hover:text-white transition-colors underline underline-offset-2">
                support@chatvid.app
              </a>
            </p>
          </div>
        </div>
      </div>

      {selectedPlan && (
        <SubscriptionModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} />
      )}
    </div>
  );
}
