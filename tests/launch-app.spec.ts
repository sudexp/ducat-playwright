import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  if (!process.env.URL) {
    throw new Error('Environment variable URL is not defined.');
  }

  await page.goto(process.env.URL);
});

test('Launch App button click', async ({ page }) => {
  const launchButton = page.locator('p.framer-text', { hasText: 'Launch App' }).first();

  await expect(launchButton).toBeVisible();
  await launchButton.click();
});
