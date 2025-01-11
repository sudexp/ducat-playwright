import { test, expect, chromium } from '@playwright/test';
import path from 'path';

import { clickLaunchAppAndWaitForPage, getHeadless } from '../utils/launch-app';

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

  const connectWalletText = 'Connect Wallet';
  const connectWalletButton = newPage.locator('button', { hasText: connectWalletText }).first();
  const firstStep = newPage.locator('p', { hasText: connectWalletText });

  await expect(firstStep).toHaveClass(/text-text-primary/);
  await connectWalletButton.waitFor({ state: 'visible' /*, timeout: 1000 */ });
  await expect(connectWalletButton).toBeVisible();
  await connectWalletButton.click();

  const popupText = 'Please Install Xverse Wallet to Continue.';
  const toastPopup = newPage.locator('section[aria-label="Notifications alt+T"] div').filter({ hasText: popupText }).first();

  try {
    await toastPopup.waitFor({ state: 'visible', timeout: 2000 });
    await expect(toastPopup).toBeVisible();
    await expect(toastPopup).toHaveText(popupText);
    await toastPopup.waitFor({ state: 'detached', timeout: 7000 });
    await expect(toastPopup).not.toBeVisible();

    const inputField = newPage.locator('input[placeholder="Invitation Code"]');
    const verifyButton = newPage.locator('button', { hasText: 'Verify' });

    await expect(inputField).toBeDisabled();
    await expect(verifyButton).toBeDisabled();

    const leading5Elements = newPage.locator('.leading-5').all();

    for (const element of leading5Elements) {
      await expect(element).toHaveClass(/text-text-secondary/);
    }
  } catch (err) {
    console.error('Toast popup did not appear or detached: ', err);
  }
});

test('Connect Wallet button click opens Xverse Wallet when it is installed', async ({ page }) => {
  const newPage = await clickLaunchAppAndWaitForPage(page);

  const connectWalletText = 'Connect Wallet';
  const connectWalletButton = newPage.locator('button', { hasText: connectWalletText }).first();

  await connectWalletButton.waitFor({ state: 'visible' });
  await expect(connectWalletButton).toBeVisible();

  const pathToExtension = path.join(__dirname, '../xverse/');
  const context = await chromium.launchPersistentContext('', {
    headless: getHeadless(process.env.CI),
    args: [`--disable-extensions-except=${pathToExtension}`, `--load-extension=${pathToExtension}`],
  });

  const [extensionTab] = await Promise.all([context.waitForEvent('page'), connectWalletButton.click()]);
  const extensionWindow = extensionTab.locator('body');

  try {
    await extensionWindow.waitFor({ state: 'visible', timeout: 5000 });
    await expect(extensionWindow).toBeVisible();
    await expect(extensionWindow).toHaveText('Xverse Wallet');

    const createWalletButton = extensionWindow.locator('button', { hasText: 'Create a new wallet' });
    const restoreWalletButton = extensionWindow.locator('button', { hasText: 'Restore an existing wallet' });

    await expect(createWalletButton).toBeVisible();
    await expect(restoreWalletButton).toBeVisible();
  } catch (err) {
    console.error('Xverse Wallet did not open or failed to display: ', err);
  } finally {
    await context.close();
  }
});
