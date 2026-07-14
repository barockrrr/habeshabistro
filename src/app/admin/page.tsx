import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { AdminDashboardClient } from '@/components/AdminDashboardClient';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/admin/sign-in');

  return <AdminDashboardClient />;
}
