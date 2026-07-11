'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { Logomark } from '@/components/brand';
import { PUBLISHER_TYPES, TONES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { completeOnboardingAction, updateSettingsAction } from '@/app/actions/account';

type Room = { id: string; name: string; description: string | null };

export function OnboardingFlow({ rooms }: { rooms: Room[] }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [publisher, setPublisher] = useState<string>('creator');
  const [roomId, setRoomId] = useState<string>(rooms[0]?.id ?? '');
  const [tone, setTone] = useState<string>('direct');
  const [pending, start] = useTransition();

  const steps = ['What you publish', 'Who you speak to', 'How you sound', 'Ready'];

  function finish() {
    start(async () => {
      if (roomId) await updateSettingsAction({ defaultRoomId: roomId });
      await completeOnboardingAction();
      router.push('/new');
    });
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6 flex items-center justify-center gap-2">
        <Logomark className="h-8 w-8" />
        <span className="text-lg font-semibold tracking-tight text-ink">readroom</span>
      </div>

      <div className="mb-6 flex items-center justify-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                i < step && 'bg-mint text-[#0f7a54]',
                i === step && 'bg-ink text-white',
                i > step && 'bg-ink/[0.06] text-ink-soft',
              )}
            >
              {i < step ? <Check className="h-3 w-3" /> : i + 1}
            </div>
            {i < steps.length - 1 && <div className="h-px w-6 bg-line" />}
          </div>
        ))}
      </div>

      <Card className="p-7">
        {step === 0 && (
          <Step title="What do you publish?" sub="This tunes the defaults — you can change everything later.">
            <div className="grid gap-2 sm:grid-cols-2">
              {PUBLISHER_TYPES.map((p) => (
                <ChoiceButton key={p.id} active={publisher === p.id} onClick={() => setPublisher(p.id)}>
                  {p.label}
                </ChoiceButton>
              ))}
            </div>
          </Step>
        )}

        {step === 1 && (
          <Step title="Who do you usually speak to?" sub="Pick a starting room. We've set up a few — you can edit or add your own anytime.">
            <div className="grid gap-2">
              {rooms.map((r) => (
                <ChoiceButton key={r.id} active={roomId === r.id} onClick={() => setRoomId(r.id)}>
                  <span className="font-medium">{r.name}</span>
                  {r.description && <span className="block text-xs text-ink-soft">{r.description}</span>}
                </ChoiceButton>
              ))}
            </div>
          </Step>
        )}

        {step === 2 && (
          <Step title="How should you sound?" sub="Your default tone. ReadRoom never flattens your voice — this is just a starting point.">
            <div className="grid gap-2 sm:grid-cols-2">
              {TONES.filter((t) => t.id !== 'custom').map((t) => (
                <ChoiceButton key={t.id} active={tone === t.id} onClick={() => setTone(t.id)}>
                  {t.label}
                </ChoiceButton>
              ))}
            </div>
            <p className="mt-4 rounded-xl bg-sand/60 p-3 text-xs text-ink-soft">
              Optional next step: build a <span className="font-medium text-ink">Voiceprint</span> from your
              real writing so rewrites always sound like you. You can do that anytime from the Voiceprints tab.
            </p>
          </Step>
        )}

        {step === 3 && (
          <Step title="You're ready to read the room." sub="We'll open the composer with a working example and contextual hints.">
            <div className="rounded-2xl bg-gradient-to-br from-lavender/50 to-blush/40 p-6 text-center">
              <Sparkles className="mx-auto h-8 w-8 text-cobalt" />
              <p className="mt-3 text-sm text-ink">
                Paste a post, choose your room, and press{' '}
                <span className="font-medium">Read the room</span>. Your first read is seconds away.
              </p>
            </div>
          </Step>
        )}

        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => (step === 0 ? router.push('/home') : setStep((s) => s - 1))}
            disabled={pending}
          >
            <ArrowLeft className="h-4 w-4" /> {step === 0 ? 'Skip' : 'Back'}
          </Button>
          {step < 3 ? (
            <Button variant="primary" onClick={() => setStep((s) => s + 1)}>
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="accent" onClick={finish} disabled={pending}>
              <Sparkles className="h-4 w-4" /> Open the composer
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

function Step({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-ink">{title}</h1>
      <p className="mt-1 text-sm text-ink-soft">{sub}</p>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function ChoiceButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-xl border px-4 py-3 text-left text-sm transition',
        active
          ? 'border-iris/50 bg-sand text-ink ring-2 ring-iris/20'
          : 'border-rule bg-white text-ink-soft hover:border-ink/20 hover:text-ink',
      )}
    >
      {children}
    </button>
  );
}
