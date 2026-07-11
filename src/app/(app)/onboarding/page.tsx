import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { getStore } from '@/lib/store';
import { OnboardingFlow } from '@/components/app/onboarding-flow';

export const metadata: Metadata = { title: 'Welcome' };

export default async function OnboardingPage() {
  const user = await requireUser();
  if (user.onboardingCompleted) redirect('/home');
  const rooms = await getStore().listRooms(user.id);
  return (
    <div className="py-6">
      <OnboardingFlow rooms={rooms.map((r) => ({ id: r.id, name: r.name, description: r.description }))} />
    </div>
  );
}
