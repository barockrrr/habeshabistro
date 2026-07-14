import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

const UpdateMenuItemSchema = z.object({
  nameEn: z.string().min(1).optional(),
  nameAm: z.string().min(1).optional().nullable(),
  emoji: z.string().optional(),
  imageUrl: z.string().url().optional().nullable(),
  description: z.string().min(1).optional(),
  price: z.number().int().positive().optional(),
  tag: z.string().optional(),
  category: z
    .enum(['FOUNDATION', 'BREAKFAST', 'TIBS', 'WOT', 'RAW_MEAT', 'VEGAN_FASTING', 'COMBOS_REGIONAL', 'APPS_SIDES'])
    .optional(),
  isVegetarian: z.boolean().optional(),
  isSpicy: z.boolean().optional(),
  available: z.boolean().optional(),
  sortOrder: z.number().int().optional()
});

// Availability toggling ("86-ing" a dish) is common enough during service
// that both MANAGER and KITCHEN can do it. Everything else on the menu
// (price, description, photo, category) is MANAGER-only.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  }

  const body = await req.json();
  const parsed = UpdateMenuItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const isAvailabilityOnlyChange = Object.keys(parsed.data).every((k) => k === 'available');
  if (!isAvailabilityOnlyChange && session.user.role !== 'MANAGER') {
    return NextResponse.json({ error: 'Only managers can edit dish details.' }, { status: 403 });
  }

  const item = await prisma.menuItem.update({ where: { id }, data: parsed.data });
  return NextResponse.json(item);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  }
  if (session.user.role !== 'MANAGER') {
    return NextResponse.json({ error: 'Only managers can delete dishes.' }, { status: 403 });
  }

  await prisma.menuItem.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
