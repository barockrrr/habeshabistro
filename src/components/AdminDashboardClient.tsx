'use client';

import { useEffect, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';

type Tab = 'orders' | 'reservations' | 'menu' | 'staff';

interface OrderItem {
  id: string;
  quantity: number;
  priceAtOrder: number;
  menuItem: { nameEn: string };
}
interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  items: OrderItem[];
}
interface Reservation {
  id: string;
  name: string;
  phone: string;
  guests: number;
  date: string;
  time: string;
  status: string;
}
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
  available: boolean;
}
interface Staff {
  id: string;
  name: string;
  email: string;
  role: 'MANAGER' | 'KITCHEN';
  createdAt: string;
}

const CATEGORIES = [
  'FOUNDATION',
  'BREAKFAST',
  'TIBS',
  'WOT',
  'RAW_MEAT',
  'VEGAN_FASTING',
  'COMBOS_REGIONAL',
  'APPS_SIDES'
];

const ORDER_STATUSES = ['RECEIVED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];

export function AdminDashboardClient() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role as 'MANAGER' | 'KITCHEN' | undefined;
  const isManager = role === 'MANAGER';

  const [tab, setTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadAll() {
    setLoading(true);
    const calls = [fetch('/api/orders'), fetch('/api/reservations'), fetch('/api/menu')];
    if (isManager) calls.push(fetch('/api/admin/staff'));

    const results = await Promise.all(calls);
    setOrders(await results[0].json());
    setReservations(await results[1].json());
    setMenuItems(await results[2].json());
    if (isManager && results[3]) setStaff(await results[3].json());
    setLoading(false);
  }

  useEffect(() => {
    if (session) loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function updateOrderStatus(id: string, status: string) {
    await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    loadAll();
  }

  async function updateReservationStatus(id: string, status: string) {
    await fetch(`/api/reservations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    loadAll();
  }

  async function toggleAvailability(item: MenuItem) {
    await fetch(`/api/menu/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available: !item.available })
    });
    loadAll();
  }

  async function deleteMenuItem(id: string) {
    if (!confirm('Delete this dish permanently?')) return;
    await fetch(`/api/menu/${id}`, { method: 'DELETE' });
    loadAll();
  }

  async function deleteStaff(id: string) {
    if (!confirm('Remove this staff account?')) return;
    await fetch(`/api/admin/staff/${id}`, { method: 'DELETE' });
    loadAll();
  }

  const visibleTabs: Tab[] = isManager ? ['orders', 'reservations', 'menu', 'staff'] : ['orders'];

  return (
    <div className="min-h-screen bg-ink">
      <nav className="sticky top-0 z-40 bg-ink-raised shadow-lg shadow-black/20 border-b border-cream/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-bold text-gold">HabeshaBistro Admin</span>
            {role && (
              <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-cream/10 text-cream-dim">
                {role}
              </span>
            )}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/admin/sign-in' })}
            className="text-sm text-cream-dim hover:text-cream"
          >
            Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex gap-2 mb-6">
          {visibleTabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-sm font-semibold capitalize transition-colors ${
                tab === t ? 'bg-berbere text-cream' : 'bg-ink-raised border border-cream/10 text-cream-dim'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        {!isManager && (
          <p className="text-xs text-cream-dim/70 mb-4">
            Kitchen staff can view and update orders. Menu, reservations, and staff management are manager-only.
          </p>
        )}

        {loading ? (
          <p className="text-cream-dim/70 text-sm">Loading…</p>
        ) : (
          <>
            {tab === 'orders' && (
              <div className="space-y-3">
                {orders.length === 0 && <p className="text-cream-dim/70 text-sm">No orders yet.</p>}
                {orders.map((o) => (
                  <div key={o.id} className="bg-ink-raised rounded-xl border border-cream/10 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-cream">{o.customerName}</p>
                        <p className="text-xs text-cream-dim">{o.customerPhone}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gold">{o.totalPrice} ETB</p>
                        <p className="text-xs text-cream-dim/70">{new Date(o.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <ul className="text-sm text-cream-dim mb-3">
                      {o.items.map((i) => (
                        <li key={i.id}>
                          {i.quantity}x {i.menuItem.nameEn}
                        </li>
                      ))}
                    </ul>
                    <select
                      value={o.status}
                      onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                      className="border border-cream/10 rounded-lg px-2 py-1 text-xs bg-ink"
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}

            {tab === 'reservations' && isManager && (
              <div className="space-y-3">
                {reservations.length === 0 && <p className="text-cream-dim/70 text-sm">No reservations yet.</p>}
                {reservations.map((r) => (
                  <div
                    key={r.id}
                    className="bg-ink-raised rounded-xl border border-cream/10 p-4 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-bold text-cream">{r.name}</p>
                      <p className="text-xs text-cream-dim">
                        {r.phone} · {r.guests} guests · {r.date} at {r.time}
                      </p>
                    </div>
                    <select
                      value={r.status}
                      onChange={(e) => updateReservationStatus(r.id, e.target.value)}
                      className="border border-cream/10 rounded-lg px-2 py-1 text-xs bg-ink"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>
                ))}
              </div>
            )}

            {tab === 'menu' && isManager && (
              <div className="space-y-3">
                <NewDishForm onCreated={loadAll} />
                {menuItems.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-ink-raised rounded-xl border p-4 flex justify-between items-center ${
                      item.available ? 'border-cream/10' : 'border-berbere/30 bg-berbere/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.imageUrl} alt={item.nameEn} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <span className="text-2xl">{item.emoji}</span>
                      )}
                      <div>
                        <p className="font-bold text-cream">
                          {item.nameEn} <span className="text-cream-dim/70 font-normal">· {item.price} ETB</span>
                        </p>
                        <p className="text-xs text-cream-dim flex items-center gap-2">
                          <span>{item.nameAm || <span className="text-gold">⚠ no Amharic name yet</span>}</span>
                          <span className="text-cream-dim/50">·</span>
                          <span>{item.category.replace('_', ' ')}</span>
                          {item.isVegetarian && <span>🌱</span>}
                          {item.isSpicy && <span>🌶️</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleAvailability(item)}
                        className={`text-xs px-3 py-1.5 rounded-full font-semibold ${
                          item.available ? 'bg-ink text-cream-dim' : 'bg-berbere/20 text-berbere-light'
                        }`}
                      >
                        {item.available ? 'Available' : "86'd — out"}
                      </button>
                      <button onClick={() => deleteMenuItem(item.id)} className="text-xs text-berbere-light hover:underline">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'staff' && isManager && <StaffTab staff={staff} onChanged={loadAll} onDelete={deleteStaff} />}
          </>
        )}
      </div>
    </div>
  );
}

function StaffTab({
  staff,
  onChanged,
  onDelete
}: {
  staff: Staff[];
  onChanged: () => void;
  onDelete: (id: string) => void;
}) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'KITCHEN' as 'MANAGER' | 'KITCHEN' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const res = await fetch('/api/admin/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error?.formErrors?.[0] || data.error || 'Failed to add staff member.');
      return;
    }
    setForm({ name: '', email: '', password: '', role: 'KITCHEN' });
    onChanged();
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="bg-ink-raised rounded-xl border border-cream/10 p-4 grid grid-cols-2 gap-2">
        <input
          required
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border border-cream/10 p-2 rounded-lg text-sm bg-ink"
        />
        <input
          required
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="border border-cream/10 p-2 rounded-lg text-sm bg-ink"
        />
        <input
          required
          type="password"
          minLength={8}
          placeholder="Temporary password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="border border-cream/10 p-2 rounded-lg text-sm bg-ink"
        />
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value as 'MANAGER' | 'KITCHEN' })}
          className="border border-cream/10 p-2 rounded-lg text-sm bg-ink"
        >
          <option value="KITCHEN">Kitchen (orders only)</option>
          <option value="MANAGER">Manager (full access)</option>
        </select>
        {error && <p className="text-xs text-berbere-light col-span-2">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="col-span-2 bg-berbere hover:bg-berbere-light text-cream py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
        >
          {saving ? 'Adding…' : '+ Add Staff Member'}
        </button>
      </form>

      <div className="space-y-2">
        {staff.map((s) => (
          <div key={s.id} className="bg-ink-raised rounded-xl border border-cream/10 p-4 flex justify-between items-center">
            <div>
              <p className="font-bold text-cream">
                {s.name} <span className="text-xs font-normal text-cream-dim">· {s.email}</span>
              </p>
              <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-cream/10 text-cream-dim">
                {s.role}
              </span>
            </div>
            <button onClick={() => onDelete(s.id)} className="text-xs text-berbere-light hover:underline">
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function NewDishForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState({
    nameEn: '',
    nameAm: '',
    emoji: '🍽️',
    imageUrl: '',
    description: '',
    price: '',
    tag: '',
    category: 'APPS_SIDES',
    isVegetarian: false,
    isSpicy: false
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    setUploading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Upload failed — you can paste an image URL below instead.');
      return;
    }
    const data = await res.json();
    setForm((f) => ({ ...f, imageUrl: data.url }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const res = await fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        nameAm: form.nameAm || undefined,
        imageUrl: form.imageUrl || undefined,
        price: parseInt(form.price, 10)
      })
    });

    setSaving(false);
    if (!res.ok) {
      setError('Failed to add dish — check all fields are filled in.');
      return;
    }
    setForm({
      nameEn: '',
      nameAm: '',
      emoji: '🍽️',
      imageUrl: '',
      description: '',
      price: '',
      tag: '',
      category: 'APPS_SIDES',
      isVegetarian: false,
      isSpicy: false
    });
    onCreated();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-ink-raised rounded-xl border border-cream/10 p-4 grid grid-cols-2 gap-2">
      <input
        required
        placeholder="Name (English)"
        value={form.nameEn}
        onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
        className="border border-cream/10 p-2 rounded-lg text-sm bg-ink"
      />
      <input
        placeholder="Name (Amharic) — optional"
        value={form.nameAm}
        onChange={(e) => setForm({ ...form, nameAm: e.target.value })}
        className="border border-cream/10 p-2 rounded-lg text-sm bg-ink"
      />
      <input
        placeholder="Emoji (used if no photo)"
        value={form.emoji}
        onChange={(e) => setForm({ ...form, emoji: e.target.value })}
        className="border border-cream/10 p-2 rounded-lg text-sm bg-ink"
      />
      <input
        required
        type="number"
        placeholder="Price (ETB)"
        value={form.price}
        onChange={(e) => setForm({ ...form, price: e.target.value })}
        className="border border-cream/10 p-2 rounded-lg text-sm bg-ink"
      />

      <div className="col-span-2 border border-dashed border-cream/20 rounded-lg p-3 space-y-2">
        <label className="block text-xs font-semibold text-cream-dim">Dish photo (optional)</label>
        <input type="file" accept="image/*" onChange={handleFileChange} className="text-xs text-cream-dim" />
        {uploading && <p className="text-xs text-gold">Uploading…</p>}
        <input
          placeholder="…or paste an image URL directly"
          value={form.imageUrl}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          className="w-full border border-cream/10 p-2 rounded-lg text-sm bg-ink"
        />
        {form.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={form.imageUrl} alt="Preview" className="h-16 w-16 object-cover rounded-lg" />
        )}
      </div>

      <select
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
        className="border border-cream/10 p-2 rounded-lg text-sm bg-ink col-span-2"
      >
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c.replace('_', ' ')}
          </option>
        ))}
      </select>
      <input
        placeholder="Tag (optional)"
        value={form.tag}
        onChange={(e) => setForm({ ...form, tag: e.target.value })}
        className="border border-cream/10 p-2 rounded-lg text-sm bg-ink col-span-2"
      />
      <label className="flex items-center gap-2 text-sm text-cream-dim">
        <input
          type="checkbox"
          checked={form.isVegetarian}
          onChange={(e) => setForm({ ...form, isVegetarian: e.target.checked })}
        />
        🌱 Vegetarian
      </label>
      <label className="flex items-center gap-2 text-sm text-cream-dim">
        <input type="checkbox" checked={form.isSpicy} onChange={(e) => setForm({ ...form, isSpicy: e.target.checked })} />
        🌶️ Spicy
      </label>
      <textarea
        required
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        className="border border-cream/10 p-2 rounded-lg text-sm bg-ink col-span-2"
      />
      {error && <p className="text-xs text-berbere-light col-span-2">{error}</p>}
      <button
        type="submit"
        disabled={saving || uploading}
        className="col-span-2 bg-berbere hover:bg-berbere-light text-cream py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
      >
        {saving ? 'Adding…' : '+ Add Dish'}
      </button>
    </form>
  );
}
