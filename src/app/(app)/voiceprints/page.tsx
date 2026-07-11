import type { Metadata } from 'next';
import { requireUser } from '@/lib/auth';
import { getStore } from '@/lib/store';
import { PageHeading } from '@/components/app/page-heading';
import { VoiceprintsManager } from '@/components/app/voiceprints-manager';

export const metadata: Metadata = { title: 'Voiceprints' };

export default async function VoiceprintsPage() {
  const user = await requireUser();
  const voiceprints = await getStore().listVoiceprints(user.id);
  return (
    <div>
      <PageHeading
        title="Voiceprints"
        subtitle="Teach ReadRoom how you sound, so every rewrite stays unmistakably you."
      />
      <VoiceprintsManager voiceprints={voiceprints} />
    </div>
  );
}
