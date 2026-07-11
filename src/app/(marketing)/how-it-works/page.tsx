import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ClipboardPaste, Users, Target, Sparkles, LayoutGrid } from 'lucide-react';
import { Button, Card } from '@/components/ui';

export const metadata: Metadata = {
  title: 'How it works',
  description: 'How ReadRoom simulates audience perception in five steps.',
};

const STEPS = [
  { icon: ClipboardPaste, title: 'Paste or upload', desc: 'Drop in a post, caption, email, bio, or a screenshot. ReadRoom reads text and images.' },
  { icon: Users, title: 'Choose the room', desc: 'Pick who will see it — followers, investors, skeptics, customers — or a general audience.' },
  { icon: Target, title: 'Set your intent', desc: 'Say what you want (authority, trust, action…), your tone, and how much risk you can take.' },
  { icon: Sparkles, title: 'Read the room', desc: 'A structured simulation appears: a Room Score, seven dimensions, and five audience perspectives.' },
  { icon: LayoutGrid, title: 'Refine on your terms', desc: 'See misread and clip risks, then take clearer, sharper, or safer rewrites that keep your voice.' },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">How ReadRoom works</h1>
        <p className="mx-auto mt-3 max-w-xl text-ink-soft">
          A pre-publishing habit that takes seconds. Five steps between your draft and a second
          perspective.
        </p>
      </div>

      <ol className="space-y-4">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <li key={s.title}>
              <Card className="flex items-start gap-5 p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sand text-cobalt">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-ink-soft">Step {i + 1}</span>
                  </div>
                  <h2 className="mt-0.5 text-lg font-semibold text-ink">{s.title}</h2>
                  <p className="mt-1 text-sm text-ink-soft">{s.desc}</p>
                </div>
              </Card>
            </li>
          );
        })}
      </ol>

      <div className="mt-10 rounded-2xl bg-ink p-8 text-center">
        <h2 className="text-2xl font-semibold text-white">See it on a real example</h2>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Button asChild variant="accent" size="lg">
            <Link href="/examples">
              View example <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20">
            <Link href="/sign-up">Get started</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
