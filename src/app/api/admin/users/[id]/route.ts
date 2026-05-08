import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'admin') return null;
  return session;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id }   = await params;
  const { plan, role } = await req.json();

  const data: Record<string, string> = {};
  if (plan && ['free', 'pro', 'business'].includes(plan)) data.plan = plan;
  if (role && ['user', 'admin'].includes(role))           data.role = role;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  const user = await db.user.update({ where: { id }, data });
  return NextResponse.json(user);
}
