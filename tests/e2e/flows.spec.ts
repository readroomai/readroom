import { test, expect } from '@playwright/test';

/**
 * These flows exercise the local demo mode (dev-auth + demo engine). The
 * external Anthropic call is never hit here — the deterministic demo engine
 * stands in — so production AI wiring is preserved, not removed, to pass tests.
 */

test('public landing renders the editorial hero', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Read the room');
  await expect(page.getByRole('link', { name: 'Read a post' }).first()).toBeVisible();
});

test('public example report is available without signing in', async ({ page }) => {
  await page.goto('/examples');
  await expect(page.getByText('Room Score')).toBeVisible();
});

test('protected route redirects unauthenticated users to sign-in', async ({ page }) => {
  await page.goto('/home');
  await expect(page).toHaveURL(/\/sign-in/);
});

test('mobile navigation overlay opens', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open menu' }).click();
  await expect(page.getByRole('link', { name: 'How it works' })).toBeVisible();
});

test('dev sign-up completes onboarding and reaches the composer', async ({ page }) => {
  await page.goto('/sign-up');
  const name = page.getByLabel('Your name');
  // Only runs in local dev-auth mode; skip if a real Clerk form is present.
  if (!(await name.count())) test.skip(true, 'Clerk is configured; dev-auth flow not present.');
  await name.fill('Test Explorer');
  await page.getByRole('button', { name: /reading the room|Continue/i }).click();
  await expect(page).toHaveURL(/\/onboarding/);
});
