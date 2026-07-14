import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Public — anyone visiting the site needs the menu.
export async function GET() {
  const items = await prisma.menuItem.findMany({
    orderBy: { sortOrder: 'asc' }
  });
  return NextResponse.json(items);
}

const CreateMenuItemSchema = z.object({
  nameEn: z.string().min(1),
  nameAm: z.string().min(1).optional().nullable(),
  emoji: z.string().default('🍽️'),
  imageUrl: z.string().url().optional().nullable(),
  description: z.string().min(1),
  price: z.number().int().positive(),
  tag: z.string().optional(),
  category: z
    .enum(['FOUNDATION', 'BREAKFAST', 'TIBS', 'WOT', 'RAW_MEAT', 'VEGAN_FASTING', 'COMBOS_REGIONAL', 'APPS_SIDES'])
    .default('APPS_SIDES'),
  isVegetarian: z.boolean().default(false),
  isSpicy: z.boolean().default(false),
  sortOrder: z.number().int().default(0)
});

// MANAGER-only — adding a new dish. KITCHEN staff can work orders but
// shouldn't be able to change the menu or prices.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  }
  if (session.user.role !== 'MANAGER') {
    return NextResponse.json({ error: 'Only managers can edit the menu.' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = CreateMenuItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const item = await prisma.menuItem.create({ data: parsed.data });
  return NextResponse.json(item, { status: 201 });
}
