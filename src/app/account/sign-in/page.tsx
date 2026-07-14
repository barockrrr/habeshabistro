'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CustomerSignInPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const res = await fetch('/api/customer/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password })
    });

    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Invalid phone number or password.');
      return;
    }
    router.push('/account');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-6">
      <div className="w-full max-w-sm bg-ink-raised rounded-2xl border border-cream/10 p-6 shadow-xl">
        <h1 className="font-display italic text-xl font-semibold text-gold mb-6">Sign In</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-cream/15 p-2 rounded-lg text-sm bg-ink text-cream focus:outline-gold"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-cream/15 p-2 rounded-lg text-sm bg-ink text-cream focus:outline-gold"
          />
          {error && <p className="text-xs text-berbere-light">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-gold hover:bg-gold-light text-ink py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
          >
            {saving ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-cream-dim">
          New here?{' '}
          <Link href="/account/sign-up" className="text-gold font-semibold">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
