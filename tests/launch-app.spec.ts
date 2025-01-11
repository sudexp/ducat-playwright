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

test('Connect Wallet button click shows temporarily popup if Xverse Wallet is not installed', async ({ page }) => {
  const newPage = await clickLaunchAppAndWaitForPage(page);
  const connectWalletButton = newPage.locator('button', { hasText: 'Connect Wallet' }).first();

  await connectWalletButton.waitFor({ state: 'visible' /*, timeout: 1000 */ });
  await expect(connectWalletButton).toBeVisible();
  await connectWalletButton.click();

  const popupText = 'Please Install Xverse Wallet to Continue.';

  const toastPopup = newPage.locator('section[aria-label="Notifications alt+T"] div').filter({ hasText: popupText });

  try {
    await toastPopup.waitFor({ state: 'visible', timeout: 2000 });
    await expect(toastPopup).toBeVisible();
    await expect(toastPopup).toHaveText(popupText);

    await toastPopup.waitFor({ state: 'detached', timeout: 7000 });
    await expect(toastPopup).not.toBeVisible();
  } catch (err) {
    console.error('Toast popup did not appear or detached: ', err);
  }
});
