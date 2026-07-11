import { redirect } from 'next/navigation';
import { getCurrentUser, isDevAuth } from '@/lib/auth';
import { getStore } from '@/lib/store';
import { getUsageStatus } from '@/lib/usage';
import { AppShell } from '@/components/app/app-shell';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in');

  const store = getStore();
  await store.ensurePresetRooms(user.id);

  const usage = await getUsageStatus(user.id);

  return (
    <AppShell
      user={{ displayName: user.displayName, email: user.email, avatarUrl: user.avatarUrl }}
      usage={{ used: usage.used, limit: usage.limit, remaining: usage.remaining }}
      isDevAuth={isDevAuth}
    >
      {children}
    </AppShell>
  );
}
