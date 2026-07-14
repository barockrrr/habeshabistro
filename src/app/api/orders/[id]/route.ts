import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { sendSms } from '@/lib/sms';

const UpdateOrderSchema = z.object({
  status: z.enum(['RECEIVED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'])
});

// Both MANAGER and KITCHEN can move an order through its statuses — this is
// the core kitchen workflow and shouldn't be gated to managers only.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  }

  const body = await req.json();
  const parsed = UpdateOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const order = await prisma.order.update({ where: { id }, data: parsed.data });

  if (parsed.data.status === 'READY') {
    sendSms(order.customerPhone, `HabeshaBistro: Your order is ready! Come on by whenever you're set.`).catch(() => {});
  }

  return NextResponse.json(order);
}
