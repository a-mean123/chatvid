import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { plan, name, email, company, message } = await req.json();

  if (!['pro', 'business'].includes(plan)) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }

  // Only one pending request at a time
  const existing = await db.subscriptionRequest.findFirst({
    where: { userId: session.user.id, status: 'pending' },
  });
  if (existing) {
    return NextResponse.json({ error: 'You already have a pending request.' }, { status: 409 });
  }

  const request = await db.subscriptionRequest.create({
    data: {
      userId:  session.user.id,
      plan,
      name:    name  || session.user.name  || '',
      email:   email || session.user.email || '',
      company: company || null,
      message: message || null,
    },
  });

  return NextResponse.json(request, { status: 201 });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const requests = await db.subscriptionRequest.findMany({
    where:   { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(requests);
}
