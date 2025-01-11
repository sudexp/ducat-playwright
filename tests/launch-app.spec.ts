import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  const ROOT_URL = process.env.ROOT_URL;

  if (!ROOT_URL) {
    throw new Error('ROOT_URL is not defined.');
  }

  await page.goto(ROOT_URL);
});

test('Launch App button click opens new page', async ({ page }) => {
  const launchButton = page.locator('p.framer-text', { hasText: 'Launch App' }).first();

  await expect(launchButton).toBeVisible();

  const [newPage] = await Promise.all([page.context().waitForEvent('page'), launchButton.click()]);
  const EARLY_SUCCESS_URL = process.env.EARLY_SUCCESS_URL;

  if (!EARLY_SUCCESS_URL) {
    throw new Error('EARLY_SUCCESS_URL is not defined');
  }

  await expect(newPage).toHaveURL(EARLY_SUCCESS_URL);
});

// TODO: reuse code from the first test
test('Connect Wallet button click', async ({ page }) => {
  const launchButton = page.locator('p.framer-text', { hasText: 'Launch App' }).first();
  const [newPage] = await Promise.all([page.context().waitForEvent('page'), launchButton.click()]);

  const EARLY_SUCCESS_URL = process.env.EARLY_SUCCESS_URL;
  if (!EARLY_SUCCESS_URL) {
    throw new Error('EARLY_SUCCESS_URL is not defined');
  }
  await expect(newPage).toHaveURL(EARLY_SUCCESS_URL);

  const connectWalletButton = newPage.locator('button', { hasText: 'Connect Wallet' }).first();

  await connectWalletButton.waitFor({ state: 'visible', timeout: 2000 });

  await expect(connectWalletButton).toBeVisible();
  await connectWalletButton.click();
});
