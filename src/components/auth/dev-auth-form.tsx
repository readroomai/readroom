'use client';

import { useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { Button, Card, Input, Label, Spinner } from '@/components/ui';
import { devSignInAction } from '@/app/actions/auth';

export function DevAuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const params = useSearchParams();
  const redirectTo = params.get('redirect_url') ?? undefined;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pending, start] = useTransition();

  return (
    <Card className="p-7">
      <div className="mb-1 flex items-center gap-2">
        <span className="rounded-full bg-sand px-2.5 py-0.5 text-xs font-medium text-cobalt">
          Local mode
        </span>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">
        {mode === 'sign-up' ? 'Create your studio' : 'Welcome back'}
      </h1>
      <p className="mt-1.5 text-sm text-ink-soft">
        This deployment isn&apos;t connected to Clerk, so ReadRoom runs on a local demo session — no
        password, no external account. Add Clerk keys to enable real sign-in.
      </p>

      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          start(() => devSignInAction({ name, email, redirectTo }));
        }}
      >
        <div>
          <Label htmlFor="name">Your name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Alex Rivera"
            autoComplete="name"
          />
        </div>
        <div>
          <Label htmlFor="email">Email (optional)</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>
        <Button type="submit" variant="accent" size="lg" className="w-full" disabled={pending}>
          {pending ? <Spinner /> : <Sparkles className="h-4 w-4" />}
          {mode === 'sign-up' ? 'Start reading the room' : 'Continue'}
        </Button>
      </form>
    </Card>
  );
}
