import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { getCurrentCustomer } from '@/lib/customerAuth';
import { sendSms } from '@/lib/sms';

const CreateOrderSchema = z.object({
  customerName: z.string().min(1),
  customerPhone: z.string().min(5),
  items: z
    .array(
      z.object({
        menuItemId: z.string(),
        quantity: z.number().int().positive()
      })
    )
    .min(1)
});

// Public — customers placing an order don't need an account, but if
// they're logged in, the order gets linked to their history automatically.
export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rate = await checkRateLimit(`order:${ip}`, { windowMs: 10 * 60 * 1000, max: 8 });
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Too many orders placed from this connection. Please try again in a few minutes.' },
      { status: 429 }
    );
  }

  const body = await req.json();
  const parsed = CreateOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { customerName, customerPhone, items } = parsed.data;

  // Look up current prices server-side — never trust a price sent from the client.
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: items.map((i) => i.menuItemId) } }
  });

  if (menuItems.length !== items.length) {
    return NextResponse.json({ error: 'One or more menu items no longer exist.' }, { status: 400 });
  }
  const unavailable = menuItems.filter((m) => !m.available);
  if (unavailable.length > 0) {
    return NextResponse.json(
      { error: `Currently unavailable: ${unavailable.map((m) => m.nameEn).join(', ')}` },
      { status: 409 }
    );
  }

  const priceMap = new Map(menuItems.map((m) => [m.id, m.price]));
  const totalPrice = items.reduce((sum, i) => sum + priceMap.get(i.menuItemId)! * i.quantity, 0);

  const loggedInCustomer = await getCurrentCustomer();

  const order = await prisma.order.create({
    data: {
      customerName,
      customerPhone,
      customerId: loggedInCustomer?.id,
      totalPrice,
      items: {
        create: items.map((i) => ({
          menuItemId: i.menuItemId,
          quantity: i.quantity,
          priceAtOrder: priceMap.get(i.menuItemId)!
        }))
      }
    },
    include: { items: { include: { menuItem: true } } }
  });

  // Fire-and-forget — a slow/failed SMS should never block order confirmation.
  sendSms(
    customerPhone,
    `HabeshaBistro: Thanks ${customerName}! Your order (${totalPrice} ETB) has been received and is being prepared.`
  ).catch(() => {});

  return NextResponse.json(order, { status: 201 });
}

// Admin-only — the kitchen/front-of-house order queue. Both MANAGER and
// KITCHEN roles can view and work the queue.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { items: { include: { menuItem: true } } }
  });
  return NextResponse.json(orders);
}
