import type { Metadata } from 'next';
import { LegalShell } from '@/components/marketing/legal-shell';

export const metadata: Metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" updated="July 2026">
      <p>
        ReadRoom handles content that can be personal and sensitive. This policy explains what we
        collect, how we use it, and the controls you have. It is written to be readable, not to hide
        behind legalese.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Account data</strong> — your name, email, and avatar from your sign-in provider.
        </li>
        <li>
          <strong>Content you submit</strong> — the text, screenshots, and context you paste in for
          analysis, plus the Rooms and Voiceprints you create.
        </li>
        <li>
          <strong>Results</strong> — the analyses ReadRoom generates and saves to your history.
        </li>
        <li>
          <strong>Usage events</strong> — minimal records (event type, model, timestamp) used to
          enforce fair-use limits. We do not store your private content inside these events.
        </li>
      </ul>

      <h2>How your content is used</h2>
      <ul>
        <li>Your content is sent to a vision-capable Claude model to produce your analysis.</li>
        <li>All model calls happen server-side. Your API keys and prompts are never exposed to the browser.</li>
        <li>We do not sell your data, and we do not use your private content to train models.</li>
        <li>In production, we do not log raw private content or full model responses by default.</li>
      </ul>

      <h2>Sharing</h2>
      <p>
        Analyses are private by default. A share link is never created automatically. When you create
        one, your original content stays hidden unless you explicitly choose to reveal it. Share pages
        never expose your email, private context, uploaded files, internal prompts, or database
        identifiers. You can revoke any link at any time.
      </p>

      <h2>Your controls</h2>
      <ul>
        <li>Delete any analysis, upload, or share link.</li>
        <li>Export a full copy of your data from Settings.</li>
        <li>Delete your account and all associated data from Settings.</li>
      </ul>

      <h2>Retention</h2>
      <p>
        We keep your reads until you delete them, or automatically for 30 days if you choose that
        option in Settings. Deleting your account removes your data.
      </p>

      <h2>Contact</h2>
      <p>Questions about privacy? Reach out through the founder note on the About page.</p>
    </LegalShell>
  );
}
