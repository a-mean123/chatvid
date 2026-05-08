'use client';

import { useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  plan: string;
  role: string;
  createdAt: string;
}

interface SubscriptionRequest {
  id: string;
  userId: string;
  plan: string;
  status: string;
  name: string;
  email: string;
  company: string | null;
  message: string | null;
  createdAt: string;
  reviewedAt: string | null;
  reviewNote: string | null;
  user?: { name: string | null; email: string | null };
}

type Tab = 'subscriptions' | 'users';

const PLAN_COLORS: Record<string, string> = {
  free:     'bg-zinc-700 text-zinc-200',
  pro:      'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30',
  business: 'bg-purple-600/30 text-purple-300 border border-purple-500/30',
};

const STATUS_COLORS: Record<string, string> = {
  pending:  'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
  active:   'bg-green-500/20 text-green-300 border border-green-500/30',
  rejected: 'bg-red-500/20 text-red-300 border border-red-500/30',
};

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${color}`}>
      {label}
    </span>
  );
}

function SubscriptionsTab() {
  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/subscriptions');
    const data = await res.json();
    setRequests(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function approve(id: string) {
    setActionId(id);
    await fetch(`/api/admin/subscriptions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve' }),
    });
    await load();
    setActionId(null);
  }

  async function reject(id: string) {
    setActionId(id);
    await fetch(`/api/admin/subscriptions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reject' }),
    });
    await load();
    setActionId(null);
  }

  async function remove(id: string) {
    setActionId(id);
    await fetch(`/api/admin/subscriptions/${id}`, { method: 'DELETE' });
    setRequests((prev) => prev.filter((r) => r.id !== id));
    setActionId(null);
  }

  if (loading) return <div className="text-zinc-500 py-12 text-center">Loading…</div>;
  if (!requests.length) return <div className="text-zinc-500 py-12 text-center">No subscription requests yet.</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
            <th className="pb-3 pr-4">User</th>
            <th className="pb-3 pr-4">Plan</th>
            <th className="pb-3 pr-4">Status</th>
            <th className="pb-3 pr-4">Company</th>
            <th className="pb-3 pr-4">Message</th>
            <th className="pb-3 pr-4">Date</th>
            <th className="pb-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/60">
          {requests.map((r) => (
            <tr key={r.id} className="hover:bg-zinc-800/30 transition-colors">
              <td className="py-3.5 pr-4">
                <p className="text-white font-medium">{r.name || r.user?.name || '—'}</p>
                <p className="text-zinc-500 text-xs">{r.email || r.user?.email || '—'}</p>
              </td>
              <td className="py-3.5 pr-4">
                <Badge label={r.plan} color={PLAN_COLORS[r.plan] ?? 'bg-zinc-700 text-zinc-300'} />
              </td>
              <td className="py-3.5 pr-4">
                <Badge label={r.status} color={STATUS_COLORS[r.status] ?? 'bg-zinc-700 text-zinc-300'} />
              </td>
              <td className="py-3.5 pr-4 text-zinc-400">{r.company || '—'}</td>
              <td className="py-3.5 pr-4 text-zinc-400 max-w-[180px] truncate">{r.message || '—'}</td>
              <td className="py-3.5 pr-4 text-zinc-500 whitespace-nowrap">
                {new Date(r.createdAt).toLocaleDateString()}
              </td>
              <td className="py-3.5">
                <div className="flex items-center gap-2">
                  {r.status === 'pending' && (
                    <>
                      <button
                        disabled={actionId === r.id}
                        onClick={() => approve(r.id)}
                        className="px-2.5 py-1 bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded-lg text-xs font-medium border border-green-600/30 transition-colors disabled:opacity-40"
                      >
                        Approve
                      </button>
                      <button
                        disabled={actionId === r.id}
                        onClick={() => reject(r.id)}
                        className="px-2.5 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg text-xs font-medium border border-red-600/30 transition-colors disabled:opacity-40"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    disabled={actionId === r.id}
                    onClick={() => remove(r.id)}
                    className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg text-xs font-medium border border-zinc-700 transition-colors disabled:opacity-40"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/users');
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function updateUser(id: string, patch: { plan?: string; role?: string }) {
    setUpdating(id);
    await fetch(`/api/admin/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    await load();
    setUpdating(null);
  }

  if (loading) return <div className="text-zinc-500 py-12 text-center">Loading…</div>;
  if (!users.length) return <div className="text-zinc-500 py-12 text-center">No users found.</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
            <th className="pb-3 pr-4">User</th>
            <th className="pb-3 pr-4">Plan</th>
            <th className="pb-3 pr-4">Role</th>
            <th className="pb-3 pr-4">Joined</th>
            <th className="pb-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/60">
          {users.map((u) => (
            <tr key={u.id} className="hover:bg-zinc-800/30 transition-colors">
              <td className="py-3.5 pr-4">
                <div className="flex items-center gap-2.5">
                  {u.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={u.image} alt="" className="w-7 h-7 rounded-full" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300">
                      {(u.name ?? u.email ?? '?')[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-white font-medium">{u.name || '—'}</p>
                    <p className="text-zinc-500 text-xs">{u.email}</p>
                  </div>
                </div>
              </td>
              <td className="py-3.5 pr-4">
                <Badge label={u.plan} color={PLAN_COLORS[u.plan] ?? 'bg-zinc-700 text-zinc-300'} />
              </td>
              <td className="py-3.5 pr-4">
                <Badge
                  label={u.role}
                  color={u.role === 'admin' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : 'bg-zinc-700 text-zinc-400'}
                />
              </td>
              <td className="py-3.5 pr-4 text-zinc-500 whitespace-nowrap">
                {new Date(u.createdAt).toLocaleDateString()}
              </td>
              <td className="py-3.5">
                <div className="flex items-center gap-2">
                  <select
                    disabled={updating === u.id}
                    value={u.plan}
                    onChange={(e) => updateUser(u.id, { plan: e.target.value })}
                    className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-500 disabled:opacity-40 cursor-pointer"
                  >
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                    <option value="business">Business</option>
                  </select>
                  <select
                    disabled={updating === u.id}
                    value={u.role}
                    onChange={(e) => updateUser(u.id, { role: e.target.value })}
                    className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-500 disabled:opacity-40 cursor-pointer"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('subscriptions');

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-zinc-500 text-sm mt-1">Manage users and subscription requests.</p>
          </div>
          <a
            href="/projects"
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-xl border border-zinc-700 transition-colors"
          >
            ← Back to app
          </a>
        </div>

        <div className="flex gap-1 mb-8 bg-zinc-900 border border-zinc-800 rounded-xl p-1 w-fit">
          {(['subscriptions', 'users'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                tab === t
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          {tab === 'subscriptions' ? <SubscriptionsTab /> : <UsersTab />}
        </div>
      </div>
    </div>
  );
}
