import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Aurora } from '@/components/aurora';
import { Button } from '@/components/ui';
import { HeroProductObject } from '@/components/marketing/hero-product';
import { FiveInterpretations } from '@/components/marketing/five-interpretations';
import { BeforeAfter } from '@/components/marketing/before-after';
import { ReactionMap } from '@/components/marketing/reaction-map';
import {
  QuickReadVisual,
  RoomsVisual,
  VoiceVisual,
  AuditVisual,
} from '@/components/marketing/capability-visuals';
import { ProductHuntBadge } from '@/components/marketing/product-hunt-badge';

export default function LandingPage() {
  return (
    <>
      {/* SECTION 1 + 2 — HERO + PRODUCT OBJECT */}
      <section className="relative overflow-hidden">
        <Aurora />
        <div className="mx-auto max-w-shell px-5 pb-24 pt-20 text-center sm:px-8 sm:pt-28">
          <p className="mb-6 text-xs uppercase tracking-[0.24em] text-ink-muted">
            AI audience intelligence
          </p>
          <h1 className="mx-auto max-w-4xl text-display-lg text-ink">
            Read the room
            <br />
            <span className="serif-italic">before you post.</span>
          </h1>
          <p className="mx-auto mt-7 max-w-readable text-lg leading-relaxed text-ink-soft">
            See how customers, followers, critics, partners, and everyone in between may interpret
            your words—before you publish them.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/sign-up">Read a post</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/examples">
                Watch it work <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <p className="mt-5 text-sm text-ink-muted">
            Private by default. Your unpublished words remain yours.
          </p>
          <div className="mt-8 flex justify-center">
            <ProductHuntBadge eager />
          </div>
        </div>

        {/* product object reveals below the fold */}
        <div className="mx-auto max-w-shell px-5 pb-24 sm:px-8">
          <HeroProductObject />
        </div>
      </section>

      {/* SECTION 3 — EDITORIAL STATEMENT */}
      <section className="mx-auto max-w-4xl px-5 py-section-lg text-center sm:px-8">
        <p className="serif text-statement text-ink">
          The same words can enter five different rooms and become five different messages.
        </p>
        <p className="mx-auto mt-8 max-w-md text-base text-ink-soft">
          ReadRoom helps you understand the difference before you press publish.
        </p>
      </section>

      {/* SECTION 4 — FIVE INTERPRETATIONS (sticky) */}
      <FiveInterpretations />

      {/* SECTION 5 — NOT ANOTHER AI WRITER */}
      <section className="mx-auto max-w-shell px-5 py-section sm:px-8">
        <div className="grid gap-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="mb-6 text-xs uppercase tracking-[0.18em] text-ink-muted">Not another AI writer</p>
            <h2 className="serif text-statement text-ink">
              ReadRoom does not write over your voice. It helps you see how your voice lands.
            </h2>
          </div>
          <div className="lg:pl-10">
            <BeforeAfter />
          </div>
        </div>
      </section>

      {/* SECTION 6 — CAPABILITIES (alternating) */}
      <section id="product" className="mx-auto max-w-shell px-5 sm:px-8">
        <Capability
          index="01"
          name="Quick Read"
          heading="Paste it. See how it lands."
          body="See the first impression, audience reactions, misreading risks, your strongest and weakest sentence, and a recommended final version—in one editorial report."
          visual={<QuickReadVisual />}
          reverse={false}
        />
        <Capability
          index="02"
          name="Audience Rooms"
          heading="Choose the room you're entering."
          body="Create rooms for customers, investors, followers, skeptics, communities, partners, or any audience that matters—each with their own values, objections, and sensitivities."
          visual={<RoomsVisual />}
          reverse
        />
        <Capability
          index="03"
          name="Voiceprint"
          heading="Recommendations that still sound like you."
          body="Build a writing profile from your existing work so every rewrite preserves your rhythm, directness, vocabulary, and the lines you refuse to soften."
          visual={<VoiceVisual />}
          reverse={false}
        />
        <Capability
          index="04"
          name="Profile Audit"
          heading="What your profile says in three seconds."
          body="Understand what your bio and recent posts communicate—and what stays unclear—through credibility, clarity, positioning, and memorability."
          visual={<AuditVisual />}
          reverse
        />
      </section>

      {/* SECTION 7 — DARK IMMERSIVE */}
      <section className="relative mt-section overflow-hidden bg-navy text-white">
        <div className="mx-auto max-w-shell px-5 py-section sm:px-8">
          <div className="max-w-2xl">
            <h2 className="serif text-statement text-white">
              Every sentence creates a reaction.
            </h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-white/60">
              ReadRoom helps you see the reaction before it becomes the conversation.
            </p>
          </div>

          <div className="mt-16">
            <ReactionMap />
          </div>

          <div className="mt-16 grid gap-8 border-t border-white/12 pt-10 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['See the first impression', 'The read a stranger forms in three seconds.'],
              ['Understand the trade-offs', 'More persuasive is not the same as less misread.'],
              ['Preserve your real voice', 'Nothing gets flattened into corporate beige.'],
              ['Decide what to change', 'You keep the edge. You choose what to soften.'],
            ].map(([t, d], i) => (
              <div key={t}>
                <p className="serif text-xl text-white">
                  <span className="mr-2 text-white/30">{`0${i + 1}`}</span>
                  {t}
                </p>
                <p className="mt-2 text-sm text-white/55">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8 — PROFILE & VOICE */}
      <section className="mx-auto max-w-shell px-5 py-section sm:px-8">
        <div className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <VoiceVisual />
          </div>
          <div className="lg:pl-8">
            <h2 className="serif text-statement text-ink">
              Sound like yourself.
              <br />
              Just harder to misunderstand.
            </h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-soft">
              Your Voiceprint captures rhythm, directness, emotional temperature, vocabulary,
              formatting habits, the phrases you love, the ones you ban, and the values you never
              soften.
            </p>
            <Button asChild variant="ghost" className="mt-6 px-0">
              <Link href="/sign-up">
                Build your Voiceprint <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* SECTION 9 — PRIVACY */}
      <section className="mx-auto max-w-shell px-5 py-section sm:px-8">
        <div className="grid gap-y-10 border-t border-rule pt-12 md:grid-cols-3 md:gap-x-12">
          {[
            ['Private by default', 'Your analyses stay private unless you explicitly create a share link.'],
            ['Designed for deletion', 'Delete an analysis, upload, Voiceprint, or your complete account data.'],
            ['No invisible publishing', 'ReadRoom never posts anything on your behalf.'],
          ].map(([t, d], i) => (
            <div key={t} className={i > 0 ? 'md:border-l md:border-rule md:pl-12' : ''}>
              <h3 className="serif text-2xl text-ink">{t}</h3>
              <p className="mt-3 text-base leading-relaxed text-ink-soft">{d}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 max-w-xl text-sm text-ink-muted">
          Content is processed server-side by a configurable, vision-capable Claude model from
          Anthropic. Keys never reach the browser, and raw private content isn&apos;t logged in
          production by default.
        </p>
      </section>

      {/* SECTION 10 — FOUNDER LETTER */}
      <section className="mx-auto max-w-4xl px-5 py-section-lg sm:px-8">
        <div className="flex items-center gap-3 text-ink-muted">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 text-sm text-ink">
            GM
          </span>
          <span className="text-sm">A note from the founder</span>
        </div>
        <blockquote className="serif mt-8 text-[clamp(1.8rem,3.6vw,3rem)] leading-[1.25] text-ink">
          “I have watched great ideas get ignored, strong messages get misunderstood, and authentic
          voices get flattened by generic advice. ReadRoom gives people another perspective before
          their words leave their hands.”
        </blockquote>
        <div className="mt-8">
          <p className="serif-italic text-xl text-ink">Gia Macool</p>
          <p className="text-sm text-ink-muted">Founder, ReadRoom</p>
        </div>
      </section>

      {/* SECTION 11 — FINAL CTA */}
      <section className="relative overflow-hidden bg-pitch text-white">
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute right-[-10%] top-[-20%] h-[60vw] w-[60vw] animate-light-drift"
            style={{
              background:
                'radial-gradient(circle at 50% 50%, rgba(244,200,174,0.28), rgba(8,8,8,0) 62%)',
            }}
          />
        </div>
        <div className="relative mx-auto max-w-shell px-5 py-section-lg text-center sm:px-8">
          <h2 className="mx-auto max-w-3xl text-display text-white">
            Know the room
            <br />
            <span className="serif-italic">before you enter it.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-md text-lg text-white/60">
            Your next post is going to be read by someone. See how it may land first.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" variant="onDark">
              <Link href="/sign-up">Read a post</Link>
            </Button>
            <Button asChild size="lg" variant="outlineDark">
              <Link href="/examples">See an example</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

function Capability({
  index,
  name,
  heading,
  body,
  visual,
  reverse,
}: {
  index: string;
  name: string;
  heading: string;
  body: string;
  visual: React.ReactNode;
  reverse: boolean;
}) {
  return (
    <div className="grid items-center gap-12 py-section lg:grid-cols-2 lg:gap-20">
      <div className={reverse ? 'lg:order-2' : ''}>
        <div className="flex items-center gap-3">
          <span className="serif text-2xl text-ink-muted">{index}</span>
          <span className="text-xs uppercase tracking-[0.16em] text-ink-muted">{name}</span>
        </div>
        <h3 className="serif mt-5 text-[clamp(1.8rem,3vw,2.6rem)] leading-tight text-ink">{heading}</h3>
        <p className="mt-4 max-w-md text-lg leading-relaxed text-ink-soft">{body}</p>
      </div>
      <div className={reverse ? 'lg:order-1' : ''}>{visual}</div>
    </div>
  );
}
