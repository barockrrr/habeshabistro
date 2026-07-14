'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CustomerSignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const res = await fetch('/api/customer/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error?.formErrors?.[0] || data.error || 'Something went wrong.');
      return;
    }
    router.push('/account');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-6">
      <div className="w-full max-w-sm bg-ink-raised rounded-2xl border border-cream/10 p-6 shadow-xl">
        <h1 className="font-display italic text-xl font-semibold text-gold mb-6">Create Your Account</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-cream/15 p-2 rounded-lg text-sm bg-ink text-cream focus:outline-gold"
          />
          <input
            required
            placeholder="Phone number"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full border border-cream/15 p-2 rounded-lg text-sm bg-ink text-cream focus:outline-gold"
          />
          <input
            type="email"
            placeholder="Email (optional)"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border border-cream/15 p-2 rounded-lg text-sm bg-ink text-cream focus:outline-gold"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full border border-cream/15 p-2 rounded-lg text-sm bg-ink text-cream focus:outline-gold"
          />
          {error && <p className="text-xs text-berbere-light">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-gold hover:bg-gold-light text-ink py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
          >
            {saving ? 'Creating…' : 'Create Account'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-cream-dim">
          Already have an account?{' '}
          <Link href="/account/sign-in" className="text-gold font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
