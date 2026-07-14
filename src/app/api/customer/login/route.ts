import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { createCustomerSession } from '@/lib/customerAuth';

const LoginSchema = z.object({
  phone: z.string().min(5),
  password: z.string().min(1)
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { phone, password } = parsed.data;
  const customer = await prisma.customer.findUnique({ where: { phone } });
  if (!customer) {
    return NextResponse.json({ error: 'Invalid phone number or password.' }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, customer.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid phone number or password.' }, { status: 401 });
  }

  await createCustomerSession(customer.id);
  return NextResponse.json({ id: customer.id, name: customer.name, phone: customer.phone });
}
