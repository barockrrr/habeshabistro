import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentCustomer } from '@/lib/customerAuth';
import { prisma } from '@/lib/db';
import { SignOutButton } from '@/components/SignOutButton';

export default async function AccountPage() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect('/account/sign-in');

  const orders = await prisma.order.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: 'desc' },
    include: { items: { include: { menuItem: true } } }
  });

  return (
    <div className="min-h-screen bg-ink text-cream">
      <nav className="sticky top-0 z-40 bg-ink/95 backdrop-blur border-b border-cream/10">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display italic text-xl font-semibold text-gold">Habesha</span>
            <span className="font-display text-xl font-semibold text-cream">Bistro</span>
          </Link>
          <SignOutButton />
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="font-display text-2xl font-semibold text-cream mb-1">Welcome back, {customer.name}</h1>
        <p className="text-cream-dim text-sm mb-8">{customer.phone}</p>

        <h2 className="font-display text-lg font-semibold text-gold mb-4">Your Orders</h2>
        {orders.length === 0 ? (
          <p className="text-cream-dim text-sm">
            No orders yet.{' '}
            <Link href="/#menu" className="text-gold underline">
              Browse the menu
            </Link>
            .
          </p>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="bg-ink-raised rounded-xl border border-cream/10 p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gold/20 text-gold font-semibold">{o.status}</span>
                  <div className="text-right">
                    <p className="font-display font-semibold text-gold">{o.totalPrice} ETB</p>
                    <p className="text-xs text-cream-dim">{new Date(o.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <ul className="text-sm text-cream-dim">
                  {o.items.map((i) => (
                    <li key={i.id}>
                      {i.quantity}x {i.menuItem.nameEn}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
