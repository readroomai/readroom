import type { Metadata } from 'next';
import { LegalShell } from '@/components/marketing/legal-shell';

export const metadata: Metadata = { title: 'AI limitations' };

export default function AiNoticePage() {
  return (
    <LegalShell title="AI & its limitations" updated="July 2026">
      <p>
        ReadRoom is powered by a large language model. We want you to use it well, which means being
        honest about what it can and cannot do.
      </p>

      <h2>What ReadRoom does</h2>
      <ul>
        <li>Simulates how different audiences may interpret your words.</li>
        <li>Separates observation (what the text does) from inference (how it may land).</li>
        <li>States the assumptions it made, and its confidence.</li>
        <li>Offers rewrites that aim to keep your voice and your meaning.</li>
      </ul>

      <h2>What ReadRoom does not do</h2>
      <ul>
        <li>It does not predict exact engagement, reach, or virality.</li>
        <li>It does not know what any specific person will actually think.</li>
        <li>It does not diagnose personalities or mental-health conditions, and never labels anyone.</li>
        <li>It does not infer protected characteristics.</li>
        <li>It is not a truth detector and does not verify facts.</li>
      </ul>

      <h2>Use your judgment</h2>
      <p>
        Treat every result as a second perspective, not a verdict. A bold, authentic message that a
        model flags as “polarising” may be exactly right for your room. ReadRoom is here to make the
        trade-offs visible — the call is always yours.
      </p>

      <h2>Configurable model</h2>
      <p>
        ReadRoom runs on a configurable, vision-capable Claude model. When no model is configured on a
        deployment, a clearly-labelled local demo engine is used so the product still works — its output
        is heuristic and always marked as a demo.
      </p>
    </LegalShell>
  );
}
