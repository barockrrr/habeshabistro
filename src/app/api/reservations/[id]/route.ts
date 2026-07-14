import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { sendSms } from '@/lib/sms';

const UpdateReservationSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED'])
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  }

  const body = await req.json();
  const parsed = UpdateReservationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const reservation = await prisma.reservation.update({ where: { id }, data: parsed.data });

  if (parsed.data.status === 'CONFIRMED') {
    sendSms(
      reservation.phone,
      `HabeshaBistro: Your table for ${reservation.guests} on ${reservation.date} at ${reservation.time} is confirmed. See you soon!`
    ).catch(() => {});
  } else if (parsed.data.status === 'CANCELLED') {
    sendSms(reservation.phone, `HabeshaBistro: Your reservation for ${reservation.date} at ${reservation.time} was cancelled.`).catch(
      () => {}
    );
  }

  return NextResponse.json(reservation);
}
