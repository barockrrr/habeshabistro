'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminSignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await signIn('credentials', { email, password, redirect: false });
    if (res?.error) {
      setError('Invalid email or password.');
      return;
    }
    router.push('/admin');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-6">
      <div className="w-full max-w-sm bg-ink-raised rounded-2xl border border-cream/10 p-6 shadow-xl">
        <h1 className="font-display italic text-xl font-semibold text-gold mb-6">HabeshaBistro Admin</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1 text-cream-dim">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-cream/15 p-2 rounded-lg text-sm bg-ink text-cream focus:outline-gold"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-cream-dim">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-cream/15 p-2 rounded-lg text-sm bg-ink text-cream focus:outline-gold"
            />
          </div>
          {error && <p className="text-xs text-berbere-light">{error}</p>}
          <button
            type="submit"
            className="w-full bg-berbere hover:bg-berbere-light text-cream py-2.5 rounded-xl text-sm font-bold transition-colors"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
