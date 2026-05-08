import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { getPlanLimits } from '@/lib/plans';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const projects = await db.project.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    select: { id: true, name: true, settings: true, createdAt: true, updatedAt: true },
  });

  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const limits = getPlanLimits(session.user.plan);

  const count = await db.project.count({ where: { userId: session.user.id } });
  if (count >= limits.maxProjects) {
    return NextResponse.json(
      { error: `Project limit reached. Upgrade your plan to create more projects.` },
      { status: 403 },
    );
  }

  const { name, script, settings, messages } = await req.json();

  const project = await db.project.create({
    data: {
      userId:   session.user.id,
      name:     name || 'Untitled Project',
      script:   script || '',
      settings: settings || {},
      messages: messages || [],
    },
  });

  return NextResponse.json(project, { status: 201 });
}
