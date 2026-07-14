import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { prisma } from './db';

const COOKIE_NAME = 'habesha_customer_session';
const SECRET = process.env.NEXTAUTH_SECRET || 'dev-only-insecure-secret-change-me';

export async function createCustomerSession(customerId: string) {
  const token = jwt.sign({ customerId }, SECRET, { expiresIn: '30d' });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/'
  });
}

export async function clearCustomerSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentCustomer() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const payload = jwt.verify(token, SECRET) as { customerId: string };
    const customer = await prisma.customer.findUnique({ where: { id: payload.customerId } });
    if (!customer) return null;
    return { id: customer.id, name: customer.name, phone: customer.phone, email: customer.email };
  } catch {
    return null; // expired or tampered token — treat as logged out
  }
}
