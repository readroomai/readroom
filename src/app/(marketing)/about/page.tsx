import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { Logomark } from '@/components/brand';

export const metadata: Metadata = {
  title: 'About',
  description: 'ReadRoom is a creator-first perception-intelligence product by Gia Macool.',
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <div className="text-center">
        <Logomark className="mx-auto h-14 w-14" />
        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Words carry weight. ReadRoom helps you feel it first.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-ink-soft">
          ReadRoom is a perception-intelligence platform — not an AI writer, grammar checker, or caption
          generator. It answers one question: <em>how is this likely to come across?</em>
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          ['Creator-first', 'Built for people whose words are public and personal.'],
          ['Privacy-conscious', 'Your drafts are private by default. You control every share.'],
          ['Honest by design', 'A simulation, never a truth detector or a diagnosis.'],
        ].map(([t, d]) => (
          <Card key={t} className="p-5">
            <p className="font-semibold text-ink">{t}</p>
            <p className="mt-1 text-sm text-ink-soft">{d}</p>
          </Card>
        ))}
      </div>

      <Card id="founder" className="mt-10 p-8 sm:p-10">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-lg font-semibold text-white">
            GM
          </div>
          <div>
            <p className="font-semibold text-ink">Gia Macool</p>
            <p className="text-xs text-ink-soft">Founder, ReadRoom</p>
          </div>
        </div>
        <blockquote className="mt-5 serif text-xl leading-relaxed text-ink sm:text-2xl">
          “I&apos;ve spent years watching good ideas get ignored, strong messages get misunderstood, and
          authentic voices get flattened by generic advice. ReadRoom is designed to give people a second
          perspective before their words leave their hands.”
        </blockquote>
        <p className="mt-5 text-sm text-ink-soft">
          The goal was never to write for you, or to make everyone sound the same. It was to build the
          thing I always wanted before hitting publish: a room I could test the words in first.
        </p>
      </Card>

      <div className="mt-10 text-center">
        <Button asChild size="lg" variant="accent">
          <Link href="/sign-up">
            Read a post <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
