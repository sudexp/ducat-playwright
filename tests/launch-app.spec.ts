import { test, expect } from '@playwright/test';

import { clickLaunchAppAndWaitForPage } from '../utils/launch-app';

test.beforeEach(async ({ page }) => {
  const ROOT_URL = process.env.ROOT_URL;

  if (!ROOT_URL) {
    throw new Error('ROOT_URL is not defined.');
  }

  await page.goto(ROOT_URL);
});

test('Launch App button click opens new page', async ({ page }) => {
  const newPage = await clickLaunchAppAndWaitForPage(page);
  const EARLY_SUCCESS_URL = process.env.EARLY_SUCCESS_URL;

  if (!EARLY_SUCCESS_URL) {
    throw new Error('EARLY_SUCCESS_URL is not defined');
  }

  await expect(newPage).toHaveURL(EARLY_SUCCESS_URL);
});

test('Connect Wallet button click', async ({ page }) => {
  const newPage = await clickLaunchAppAndWaitForPage(page);
  const connectWalletButton = newPage.locator('button', { hasText: 'Connect Wallet' }).first();

  await connectWalletButton.waitFor({ state: 'visible' /*, timeout: 1000 */ });
  await expect(connectWalletButton).toBeVisible();
  await connectWalletButton.click();
});
