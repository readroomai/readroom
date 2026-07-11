import type { Metadata } from 'next';
import { LegalShell } from '@/components/marketing/legal-shell';

export const metadata: Metadata = { title: 'Terms of Use' };

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Use" updated="July 2026">
      <p>
        By using ReadRoom you agree to these terms. ReadRoom is provided as a free public beta and is
        offered “as is” while we continue to improve it.
      </p>

      <h2>What ReadRoom is</h2>
      <p>
        ReadRoom is an audience-perception simulator. It analyses language, context, and platform
        conventions to produce an uncertainty-aware simulation of how content may be interpreted. It is
        not a prediction of engagement, a statement of fact, a legal or financial opinion, or a
        psychological assessment.
      </p>

      <h2>Acceptable use</h2>
      <ul>
        <li>Submit content you have the right to submit.</li>
        <li>Do not use ReadRoom to harass, deceive, manipulate, or harm others.</li>
        <li>Do not attempt to scrape third-party platforms through ReadRoom. Paste or upload your own content.</li>
        <li>Respect the fair-use limits of the free beta.</li>
      </ul>

      <h2>Your content</h2>
      <p>
        You keep ownership of everything you submit and everything ReadRoom generates for you. You are
        responsible for what you ultimately choose to publish. ReadRoom&apos;s suggestions are exactly
        that — suggestions.
      </p>

      <h2>Availability & changes</h2>
      <p>
        Features may change during the beta. We may introduce paid plans later; we will not silently
        convert your account or charge you without clear, explicit consent.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, ReadRoom is not liable for outcomes that result from
        content you publish. The final decision — and its consequences — are always yours.
      </p>
    </LegalShell>
  );
}
