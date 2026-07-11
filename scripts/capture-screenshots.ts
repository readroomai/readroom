/**
 * Captures polished launch screenshots into public/launch-assets/ using the
 * real ReadRoom interface in local demo mode. Run the dev server first (or set
 * PLAYWRIGHT_BASE_URL), then:
 *
 *   npm run seed          # optional: populate demo history
 *   npm run screenshots
 *
 * Requires Playwright browsers: npx playwright install chromium
 */
import { chromium } from '@playwright/test';
import path from 'node:path';
import { promises as fs } from 'node:fs';

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
const OUT = path.join(process.cwd(), 'public', 'launch-assets');
const SIZE = { width: 1600, height: 1000 };

const devCookie = Buffer.from(
  JSON.stringify({
    clerkUserId: 'dev_screenshot',
    email: 'you@readroom.local',
    displayName: 'ReadRoom Explorer',
  }),
  'utf8',
).toString('base64url');

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: SIZE, deviceScaleFactor: 2 });
  await context.addCookies([
    { name: 'rr_dev_session', value: devCookie, url: BASE },
  ]);
  const page = await context.newPage();

  const shots: [string, string][] = [
    ['/', 'shot-landing-hero.png'],
    ['/examples', 'shot-analysis-report.png'],
    ['/new', 'shot-new-read.png'],
    ['/rooms', 'shot-audience-rooms.png'],
    ['/voiceprints', 'shot-voiceprints.png'],
    ['/audit', 'shot-profile-audit.png'],
  ];

  for (const [route, file] of shots) {
    await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(900);
    await page.screenshot({ path: path.join(OUT, file) });
    console.log(`captured ${route} -> ${file}`);
  }

  await browser.close();
  console.log(`Saved screenshots to ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
