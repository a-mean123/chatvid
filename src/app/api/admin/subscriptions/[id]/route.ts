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
  const { action, note } = await req.json(); // action: "approve" | "reject"

  const request = await db.subscriptionRequest.findUnique({ where: { id } });
  if (!request) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (action === 'approve') {
    await Promise.all([
      db.subscriptionRequest.update({
        where: { id },
        data: { status: 'active', reviewedAt: new Date(), reviewNote: note ?? null },
      }),
      db.user.update({
        where: { id: request.userId },
        data:  { plan: request.plan },
      }),
    ]);
  } else if (action === 'reject') {
    await db.subscriptionRequest.update({
      where: { id },
      data: { status: 'rejected', reviewedAt: new Date(), reviewNote: note ?? null },
    });
  } else {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { id } = await params;
  await db.subscriptionRequest.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
