import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  }
  if (session.user.role !== 'MANAGER') {
    return NextResponse.json({ error: 'Only managers can manage staff accounts.' }, { status: 403 });
  }
  if (id === session.user.id) {
    return NextResponse.json({ error: "You can't delete your own account while logged in as it." }, { status: 400 });
  }

  await prisma.adminUser.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
