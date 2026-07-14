'use client';

import { useRouter } from 'next/navigation';

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await fetch('/api/customer/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  return (
    <button onClick={handleSignOut} className="text-sm text-cream-dim hover:text-cream transition-colors">
      Sign out
    </button>
  );
}
