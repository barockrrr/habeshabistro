import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

const CreateStaffSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['MANAGER', 'KITCHEN']).default('KITCHEN')
});

async function requireManager() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 }) };
  if (session.user.role !== 'MANAGER')
    return { error: NextResponse.json({ error: 'Only managers can manage staff accounts.' }, { status: 403 }) };
  return { session };
}

export async function GET() {
  const check = await requireManager();
  if (check.error) return check.error;

  const staff = await prisma.adminUser.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true, email: true, role: true, createdAt: true } // never return passwordHash
  });
  return NextResponse.json(staff);
}

export async function POST(req: Request) {
  const check = await requireManager();
  if (check.error) return check.error;

  const body = await req.json();
  const parsed = CreateStaffSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, email, password, role } = parsed.data;
  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const staff = await prisma.adminUser.create({
    data: { name, email, passwordHash, role },
    select: { id: true, name: true, email: true, role: true, createdAt: true }
  });

  return NextResponse.json(staff, { status: 201 });
}
