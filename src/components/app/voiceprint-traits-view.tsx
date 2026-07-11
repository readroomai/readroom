import { Badge, Card } from '@/components/ui';
import type { VoiceprintTraits } from '@/lib/ai/schemas';

export function VoiceprintTraitsView({ traits }: { traits: VoiceprintTraits }) {
  const rows: [string, string][] = [
    ['Sentence rhythm', traits.sentenceRhythm],
    ['Vocabulary', traits.vocabularyStyle],
    ['Directness', traits.directness],
    ['Confidence', traits.confidenceLevel],
    ['Emotional temperature', traits.emotionalTemperature],
    ['Humour', traits.useOfHumour],
    ['Contrast', traits.useOfContrast],
    ['Hooks', traits.useOfHooks],
    ['Storytelling', traits.useOfStorytelling],
    ['Typical structure', traits.typicalStructure],
  ];
  return (
    <div className="space-y-4">
      <Card className="p-5">
        <p className="text-sm leading-relaxed text-ink">{traits.summary}</p>
      </Card>
      <div className="grid gap-3 sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <div key={k} className="rounded-xl border border-rule bg-white p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-soft">{k}</p>
            <p className="mt-0.5 text-sm text-ink">{v}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <ChipList title="Preserve these" items={traits.phrasesToPreserve} tone="mint" />
        <ChipList title="Avoid these" items={traits.phrasesToAvoid} tone="blush" />
        <ChipList title="Strengths" items={traits.commonStrengths} tone="iris" />
        <ChipList title="Habits to watch" items={traits.commonHabits} tone="neutral" />
      </div>
      {traits.nonNegotiableValues.length > 0 && (
        <ChipList title="Non-negotiable values" items={traits.nonNegotiableValues} tone="ice" />
      )}
      <Card className="p-5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
          Machine instruction (used in rewrites)
        </p>
        <p className="mt-1 font-mono text-xs leading-relaxed text-ink">{traits.machineInstruction}</p>
      </Card>
      {traits.sampleOutput && (
        <Card className="bg-sand/60 p-5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-cobalt">
            Sample in this voice
          </p>
          <p className="mt-1 text-sm italic text-ink">“{traits.sampleOutput}”</p>
        </Card>
      )}
    </div>
  );
}

function ChipList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: 'mint' | 'blush' | 'iris' | 'ice' | 'neutral';
}) {
  if (!items.length) return null;
  return (
    <div className="rounded-xl border border-rule bg-white p-3">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-ink-soft">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((it, i) => (
          <Badge key={i} tone={tone}>
            {it}
          </Badge>
        ))}
      </div>
    </div>
  );
}
