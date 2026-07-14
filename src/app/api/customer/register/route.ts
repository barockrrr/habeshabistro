import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { createCustomerSession } from '@/lib/customerAuth';

const RegisterSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(5),
  email: z.string().email().optional(),
  password: z.string().min(6)
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, phone, email, password } = parsed.data;

  const existing = await prisma.customer.findUnique({ where: { phone } });
  if (existing) {
    return NextResponse.json({ error: 'An account with this phone number already exists.' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const customer = await prisma.customer.create({ data: { name, phone, email, passwordHash } });

  await createCustomerSession(customer.id);
  return NextResponse.json({ id: customer.id, name: customer.name, phone: customer.phone }, { status: 201 });
}
