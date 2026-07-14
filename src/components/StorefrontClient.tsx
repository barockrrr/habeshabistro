'use client';

import { useState } from 'react';
import Link from 'next/link';
import { JebenaIllustration } from './JebenaIllustration';
import { TiletDivider } from './TiletDivider';

interface MenuItem {
  id: string;
  nameEn: string;
  nameAm: string | null;
  emoji: string;
  imageUrl: string | null;
  price: number;
  tag: string | null;
  description: string;
  category: string;
  isVegetarian: boolean;
  isSpicy: boolean;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  FOUNDATION: 'The Foundation',
  BREAKFAST: 'Breakfast',
  TIBS: 'Sautéed Meats (Tibs)',
  WOT: 'Stews (Wat)',
  RAW_MEAT: 'Raw Meat Delicacies',
  VEGAN_FASTING: 'Vegan & Fasting (Yetsom)',
  COMBOS_REGIONAL: 'Combos & Regional Specialties',
  APPS_SIDES: 'Apps & Sides'
};
const CATEGORY_ORDER = [
  'FOUNDATION',
  'BREAKFAST',
  'TIBS',
  'WOT',
  'RAW_MEAT',
  'VEGAN_FASTING',
  'COMBOS_REGIONAL',
  'APPS_SIDES'
];

export function StorefrontClient({ menuItems, customer }: { menuItems: MenuItem[]; customer: Customer | null }) {
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingData, setBookingData] = useState({ name: '', phone: '', guests: '2', date: '', time: '' });
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const [bookingError, setBookingError] = useState('');

  const [orderStatus, setOrderStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const [orderError, setOrderError] = useState('');
  const [customerName, setCustomerName] = useState(customer?.name || '');
  const [customerPhone, setCustomerPhone] = useState(customer?.phone || '');

  const addToCart = (id: string) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };
  const clearCart = () => setCart({});

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalPrice = menuItems.reduce((sum, dish) => sum + (cart[dish.id] || 0) * dish.price, 0);

  async function handleBookingSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBookingStatus('saving');
    setBookingError('');

    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...bookingData, guests: parseInt(bookingData.guests, 10) })
    });

    if (!res.ok) {
      const data = await res.json();
      setBookingStatus('error');
      setBookingError(data.error?.formErrors?.[0] || 'Something went wrong. Please try again.');
      return;
    }

    setBookingStatus('done');
    setTimeout(() => {
      setIsBookingOpen(false);
      setBookingStatus('idle');
      setBookingData({ name: '', phone: '', guests: '2', date: '', time: '' });
    }, 1800);
  }

  async function handleConfirmOrder() {
    if (!customerName || !customerPhone) {
      setOrderError('Please enter your name and phone number to place the order.');
      return;
    }
    setOrderStatus('saving');
    setOrderError('');

    const items = Object.entries(cart).map(([menuItemId, quantity]) => ({ menuItemId, quantity }));

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerName, customerPhone, items })
    });

    if (!res.ok) {
      const data = await res.json();
      setOrderStatus('error');
      setOrderError(data.error?.formErrors?.[0] || data.error || 'Something went wrong. Please try again.');
      return;
    }

    setOrderStatus('done');
    clearCart();
    setCustomerName('');
    setCustomerPhone('');
    setTimeout(() => setOrderStatus('idle'), 3000);
  }

  return (
    <div className="min-h-screen bg-ink text-cream">
      {/* --- NAVIGATION --- */}
      <nav className="sticky top-0 z-40 bg-ink/95 backdrop-blur border-b border-cream/10">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-display italic text-2xl font-semibold text-gold">Habesha</span>
            <span className="font-display text-2xl font-semibold text-cream">Bistro</span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#menu"
              className="hidden sm:block text-sm font-medium text-cream-dim hover:text-cream transition-colors"
            >
              Menu
            </a>
            <Link
              href={customer ? '/account' : '/account/sign-in'}
              className="hidden sm:block text-sm font-medium text-cream-dim hover:text-cream transition-colors"
            >
              {customer ? customer.name.split(' ')[0] : 'Sign in'}
            </Link>
            <button
              onClick={() => setIsBookingOpen(true)}
              className="bg-berbere hover:bg-berbere-light text-cream px-4 py-2 rounded-full font-semibold text-sm transition-colors shadow-[0_0_0_1px_rgba(240,223,192,0.08)]"
            >
              Book a Table
            </button>
            <div key={totalItems} className="animate-pop bg-ink-raised border border-gold/30 px-3 py-2 rounded-full text-xs font-bold text-gold hidden sm:block">
              🛒 {totalItems}
            </div>
          </div>
        </div>
      </nav>
      <TiletDivider />

      {/* --- HERO --- */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{ background: 'radial-gradient(ellipse at 75% 20%, #A8371F 0%, transparent 60%)' }}
        />
        <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              Addis Ababa–Style Ethiopian Kitchen
            </span>
            <h1 className="mt-4 font-display italic font-semibold text-4xl md:text-5xl leading-tight text-cream">
              Gathered around one plate.
            </h1>
            <p className="mt-5 max-w-md text-cream-dim leading-relaxed">
              Slow-simmered wats, sizzling tibs, and fresh injera — served the way it's meant to be shared. Order
              ahead, or reserve a table and let us pour the coffee.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#menu"
                className="bg-gold hover:bg-gold-light text-ink px-6 py-3 rounded-full font-semibold text-sm transition-colors"
              >
                View the Menu
              </a>
              <button
                onClick={() => setIsBookingOpen(true)}
                className="border border-cream/25 hover:bg-ink-raised px-6 py-3 rounded-full font-semibold text-sm transition-colors"
              >
                Reserve a Table
              </button>
            </div>
          </div>
          <div className="flex justify-center md:justify-end">
            <JebenaIllustration className="w-56 md:w-72" />
          </div>
        </div>
      </section>
      <TiletDivider />

      {/* --- MAIN LAYOUT --- */}
      <main id="menu" className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Menu System */}
        <div className="lg:col-span-2">
          {menuItems.length === 0 ? (
            <p className="text-cream-dim text-sm">No dishes available right now — please check back soon.</p>
          ) : (
            CATEGORY_ORDER.filter((cat) => menuItems.some((d) => d.category === cat)).map((cat) => (
              <div key={cat} className="mb-12">
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="font-display text-xl font-semibold text-gold whitespace-nowrap">
                    {CATEGORY_LABELS[cat] || cat}
                  </h2>
                  <div className="h-px flex-1 bg-cream/10" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {menuItems
                    .filter((d) => d.category === cat)
                    .map((dish) => (
                      <div
                        key={dish.id}
                        className="bg-ink-raised rounded-2xl border border-cream/10 p-4 flex flex-col justify-between transition-all hover:border-gold/40 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-8px_rgba(232,169,59,0.25)]"
                      >
                        <div>
                          <div className="h-28 bg-ink rounded-xl flex items-center justify-center text-5xl mb-4 overflow-hidden">
                            {dish.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={dish.imageUrl} alt={dish.nameEn} className="w-full h-full object-cover" />
                            ) : (
                              dish.emoji
                            )}
                          </div>
                          <div className="flex justify-between items-start mb-2 gap-2">
                            <div className="flex flex-wrap gap-1">
                              {dish.tag && (
                                <span className="text-[11px] bg-cream/10 px-2 py-0.5 rounded-full text-cream-dim">
                                  {dish.tag}
                                </span>
                              )}
                              {dish.isVegetarian && (
                                <span
                                  className="text-[11px] bg-tilet-green/25 px-2 py-0.5 rounded-full text-green-300"
                                  title="Vegetarian"
                                >
                                  🌱 Veg
                                </span>
                              )}
                              {dish.isSpicy && (
                                <span
                                  className="text-[11px] bg-berbere/25 px-2 py-0.5 rounded-full text-berbere-light"
                                  title="Spicy"
                                >
                                  🌶️ Spicy
                                </span>
                              )}
                            </div>
                            <span className="font-display font-semibold text-gold whitespace-nowrap">
                              {dish.price} ETB
                            </span>
                          </div>
                          <h3 className="font-display text-lg font-semibold text-cream">{dish.nameEn}</h3>
                          {dish.nameAm && <p className="font-amharic text-sm text-gold/80 mb-2">{dish.nameAm}</p>}
                          <p className="text-xs text-cream-dim leading-relaxed">{dish.description}</p>
                        </div>
                        <button
                          onClick={() => addToCart(dish.id)}
                          className="mt-4 w-full bg-berbere hover:bg-berbere-light text-cream text-xs py-2.5 rounded-lg font-semibold active:scale-95 transition-transform"
                        >
                          + Add to Basket {cart[dish.id] > 0 && `(${cart[dish.id]})`}
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Ordering Sidebar Checkout Panel */}
        <div className="bg-ink-raised rounded-2xl border border-cream/10 p-6 h-fit sticky top-28">
          <h3 className="font-display text-xl font-semibold text-cream mb-4 pb-3 border-b border-cream/10">
            Your Order
          </h3>
          {totalItems === 0 ? (
            <p className="text-cream-dim text-sm py-8 text-center">Your basket is empty. Add some food items above!</p>
          ) : orderStatus === 'done' ? (
            <div className="py-8 text-center">
              <p className="text-3xl mb-2">✅</p>
              <p className="text-sm font-semibold text-gold">Order placed! The kitchen has it now.</p>
            </div>
          ) : (
            <div>
              <div className="space-y-3 mb-4">
                {menuItems.map((dish) => {
                  const qty = cart[dish.id] || 0;
                  if (qty === 0) return null;
                  return (
                    <div key={dish.id} className="flex justify-between text-sm">
                      <span>
                        <strong className="text-gold">{qty}x</strong> {dish.nameEn}
                      </span>
                      <span className="font-semibold text-cream-dim">{dish.price * qty} ETB</span>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-cream/10 pt-3 mb-4 flex justify-between font-display font-semibold text-cream">
                <span>Total</span>
                <span className="text-gold">{totalPrice} ETB</span>
              </div>

              <div className="space-y-2 mb-3">
                <input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Your name"
                  className="w-full border border-cream/15 p-2 rounded-lg text-sm bg-ink text-cream placeholder:text-cream-dim/50 focus:outline-gold"
                />
                <input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Phone number"
                  className="w-full border border-cream/15 p-2 rounded-lg text-sm bg-ink text-cream placeholder:text-cream-dim/50 focus:outline-gold"
                />
              </div>

              {orderError && <p className="text-xs text-berbere-light mb-2">{orderError}</p>}

              <button
                onClick={handleConfirmOrder}
                disabled={orderStatus === 'saving'}
                className="w-full bg-gold hover:bg-gold-light text-ink py-2.5 rounded-xl font-bold transition-colors mb-2 disabled:opacity-50"
              >
                {orderStatus === 'saving' ? 'Placing order…' : 'Confirm Order'}
              </button>
              <button onClick={clearCart} className="w-full text-xs text-cream-dim hover:text-cream transition-colors">
                Clear All
              </button>
            </div>
          )}
        </div>
      </main>

      {/* --- BOOKING MODAL --- */}
      {isBookingOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-ink-high rounded-2xl max-w-md w-full shadow-xl relative overflow-hidden">
            <TiletDivider />
            <div className="p-6">
              {bookingStatus === 'done' ? (
                <div className="py-10 text-center">
                  <p className="text-3xl mb-2">✅</p>
                  <p className="text-sm font-semibold text-gold">Reservation confirmed!</p>
                  <p className="font-amharic text-xs text-cream-dim mt-1">ያቀዱት ቦታ በተሳካ ሁኔታ ተይዟል!</p>
                </div>
              ) : (
                <>
                  <h3 className="font-display text-2xl font-semibold text-cream mb-1">Reserve a Table</h3>
                  <p className="font-amharic text-sm text-gold mb-4">የምግብ ጠረጴዛ ቦታ ያስይዙ</p>

                  <form onSubmit={handleBookingSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-cream-dim">Full Name</label>
                      <input
                        type="text"
                        required
                        value={bookingData.name}
                        onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                        className="w-full border border-cream/15 p-2 rounded-lg text-sm bg-ink text-cream focus:outline-gold"
                        placeholder="Abebe Bikila"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-cream-dim">Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={bookingData.phone}
                        onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                        className="w-full border border-cream/15 p-2 rounded-lg text-sm bg-ink text-cream focus:outline-gold"
                        placeholder="+251 9..."
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-cream-dim">Guests</label>
                        <select
                          value={bookingData.guests}
                          onChange={(e) => setBookingData({ ...bookingData, guests: e.target.value })}
                          className="w-full border border-cream/15 p-2 rounded-lg text-sm bg-ink text-cream"
                        >
                          <option value="1">1 Person</option>
                          <option value="2">2 People</option>
                          <option value="4">4 People</option>
                          <option value="6">6+ People</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold mb-1 text-cream-dim">Date & Time</label>
                        <div className="flex space-x-1">
                          <input
                            type="date"
                            required
                            value={bookingData.date}
                            onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                            className="w-1/2 border border-cream/15 p-2 rounded-lg text-xs bg-ink text-cream"
                          />
                          <input
                            type="time"
                            required
                            value={bookingData.time}
                            onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                            className="w-1/2 border border-cream/15 p-2 rounded-lg text-xs bg-ink text-cream"
                          />
                        </div>
                      </div>
                    </div>

                    {bookingError && <p className="text-xs text-berbere-light">{bookingError}</p>}

                    <div className="flex space-x-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsBookingOpen(false)}
                        className="w-1/2 bg-ink-raised hover:bg-ink border border-cream/10 text-cream-dim py-2.5 rounded-xl text-sm font-semibold transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={bookingStatus === 'saving'}
                        className="w-1/2 bg-berbere hover:bg-berbere-light text-cream py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                      >
                        {bookingStatus === 'saving' ? 'Booking…' : 'Book Now'}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
