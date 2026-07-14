import { prisma } from '@/lib/db';
import { getCurrentCustomer } from '@/lib/customerAuth';
import { StorefrontClient } from '@/components/StorefrontClient';

export const dynamic = 'force-dynamic'; // always show current menu/availability, never a stale cached build

export default async function Home() {
  const [menuItems, customer] = await Promise.all([
    prisma.menuItem.findMany({ where: { available: true }, orderBy: { sortOrder: 'asc' } }),
    getCurrentCustomer()
  ]);

  return <StorefrontClient menuItems={menuItems} customer={customer} />;
}
