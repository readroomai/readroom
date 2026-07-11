import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowUpRight, Users, Fingerprint, UserSearch, GitCompareArrows } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { getStore } from '@/lib/store';
import { QuickReadComposer } from '@/components/app/quick-read-composer';
import { Card, Badge } from '@/components/ui';
import { AnalysisRow } from '@/components/app/analysis-row';
import { scoreBand } from '@/lib/utils';

export const metadata: Metadata = { title: 'Home' };

export default async function HomePage() {
  const user = await requireUser();
  if (!user.onboardingCompleted) redirect('/onboarding');

  const store = getStore();
  const [rooms, voiceprints, settings, recent] = await Promise.all([
    store.listRooms(user.id),
    store.listVoiceprints(user.id),
    store.getSettings(user.id),
    store.listAnalyses(user.id),
  ]);

  const firstName = (user.displayName ?? 'there').split(' ')[0];
  const defaultVoice = voiceprints.find((v) => v.isDefault);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-ink-soft">Welcome back</p>
          <h1 className="serif text-3xl text-ink">Hi {firstName} — who are you talking to today?</h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-ink-soft">
          <Badge tone="iris">{voiceprints.length ? `Voice: ${defaultVoice?.name ?? voiceprints[0].name}` : 'No Voiceprint yet'}</Badge>
          <Badge tone="ice">{rooms.length} rooms</Badge>
        </div>
      </div>

      <QuickReadComposer
        rooms={rooms.map((r) => ({ id: r.id, name: r.name }))}
        voiceprints={voiceprints.map((v) => ({ id: v.id, name: v.name, isDefault: v.isDefault }))}
        defaultRoomId={settings.defaultRoomId}
        compact
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">Recent reads</h2>
            {recent.length > 0 && (
              <Link href="/history" className="text-sm text-ink-soft hover:text-ink">
                View all
              </Link>
            )}
          </div>
          {recent.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-sm text-ink-soft">
                Your reads will appear here. Run your first one above to get started.
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {recent.slice(0, 5).map((a) => (
                <AnalysisRow key={a.id} analysis={a} />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">Jump to</h2>
          <QuickLink href="/rooms" icon={<Users className="h-4 w-4" />} title="Audience Rooms" desc={`${rooms.length} saved`} />
          <QuickLink href="/voiceprints" icon={<Fingerprint className="h-4 w-4" />} title="Voiceprints" desc={voiceprints.length ? `${voiceprints.length} saved` : 'Build your first'} />
          <QuickLink href="/audit" icon={<UserSearch className="h-4 w-4" />} title="Profile Audit" desc="Audit your bio & posts" />
          <QuickLink href="/compare" icon={<GitCompareArrows className="h-4 w-4" />} title="Compare" desc="Test 2–4 variants" />
        </div>
      </div>

      {recent.length > 0 && (
        <p className="text-xs text-ink-soft">
          Best recent read:{' '}
          <span className="font-medium text-ink">
            {Math.max(...recent.map((r) => (isQuick(r) ? r.result.roomScore : 0)))} —{' '}
            {scoreBand(Math.max(...recent.map((r) => (isQuick(r) ? r.result.roomScore : 0)))).label}
          </span>
        </p>
      )}
    </div>
  );
}

function isQuick(a: { analysisType: string; result: unknown }): a is { analysisType: string; result: { roomScore: number } } {
  return a.analysisType === 'quick_read' && typeof (a.result as { roomScore?: number })?.roomScore === 'number';
}

function QuickLink({
  href,
  icon,
  title,
  desc,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Link href={href}>
      <Card className="flex items-center gap-3 p-4 transition hover:shadow-object-sm">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sand text-cobalt">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink">{title}</p>
          <p className="text-xs text-ink-soft">{desc}</p>
        </div>
        <ArrowUpRight className="h-4 w-4 text-ink-soft" />
      </Card>
    </Link>
  );
}
