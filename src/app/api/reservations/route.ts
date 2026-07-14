import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { sendSms } from '@/lib/sms';

const CreateReservationSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(5),
  guests: z.number().int().positive(),
  date: z.string().min(1), // "YYYY-MM-DD"
  time: z.string().min(1) // "HH:mm"
});

// Public — customers booking a table don't need an account.
export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rate = await checkRateLimit(`reservation:${ip}`, { windowMs: 10 * 60 * 1000, max: 8 });
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Too many reservation attempts from this connection. Please try again in a few minutes.' },
      { status: 429 }
    );
  }

  const body = await req.json();
  const parsed = CreateReservationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const reservation = await prisma.reservation.create({ data: parsed.data });

  sendSms(
    reservation.phone,
    `HabeshaBistro: Thanks ${reservation.name}! We've received your reservation request for ${reservation.guests} guest(s) on ${reservation.date} at ${reservation.time}. We'll confirm shortly.`
  ).catch(() => {});

  return NextResponse.json(reservation, { status: 201 });
}

// Admin-only — front-of-house reservation book.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  }

  const reservations = await prisma.reservation.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(reservations);
}
