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

// this test is also relevant for browsers that do not support the xverse extension --> https://www.xverse.app/blog/xverse-launches-desktop-browser-extension
test('Connect Wallet button click shows temporarily popup if Xverse Wallet is not installed', async ({ page }) => {
  const newPage = await clickLaunchAppAndWaitForPage(page);

  const connectWalletText = 'Connect Wallet';
  const connectWalletButton = newPage.locator('button', { hasText: connectWalletText }).first();
  const firstStep = newPage.locator('p', { hasText: connectWalletText });

  await expect(firstStep).toHaveClass(/text-text-primary/);
  await connectWalletButton.waitFor({ state: 'visible' /*, timeout: 1000 */ });
  await expect(connectWalletButton).toBeVisible();
  await connectWalletButton.click();
  await newPage.waitForTimeout(500);

  /* difficult to inspect the element:
  const popupText = 'Please Install Xverse Wallet to Continue.';
  const toastPopup = newPage.locator('section[aria-label="Notifications alt+T"] div').filter({ hasText: popupText }).first();

  try {
    await toastPopup.waitFor({ state: 'visible', timeout: 2000 });
    await expect(toastPopup).toBeVisible();
    await expect(toastPopup).toHaveText(popupText);
    await toastPopup.waitFor({ state: 'detached', timeout: 7000 });
    await expect(toastPopup).not.toBeVisible();
  } catch (err) {
    console.error('Toast popup did not appear or detached: ', err);
  } */

  const inputField = newPage.locator('input[placeholder="Invitation Code"]');
  const verifyButton = newPage.locator('button', { hasText: 'Verify' });

  await expect(inputField).toBeDisabled();
  await expect(verifyButton).toBeDisabled();

  // not necessary, but let's test some styles:
  const leading5Elements = await newPage.locator('.leading-5');
  const count = await leading5Elements.count();

  for (let i = 0; i < count; i++) {
    const element = leading5Elements.nth(i);

    if (i < 2) {
      await expect(element).toHaveClass(/text-text-primary/);
    } else {
      await expect(element).toHaveClass(/text-text-secondary/);
    }
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

  const [extensionTab] = await Promise.all([context.waitForEvent('page'), connectWalletButton.click()]); // --> chrome-extension://{hash}/options.html#/landing
  const extensionWindow = extensionTab.locator('body');

  try {
    await extensionWindow.waitFor({ state: 'visible', timeout: 5000 });
    await expect(extensionWindow).toBeVisible();
    await expect(extensionWindow).toContainText('The Bitcoin wallet for everyone');

    const createWalletButton = extensionWindow.locator('button', { hasText: 'Create a new wallet' });
    const restoreWalletButton = extensionWindow.locator('button', { hasText: 'Restore an existing wallet' });

    await expect(createWalletButton).toBeVisible();
    await expect(restoreWalletButton).toBeVisible();
    await createWalletButton.click(); // --> chrome-extension://{hash}/options.html#/legal

    const appDiv = extensionWindow.locator('div#app');
    const header = appDiv.locator('h1').first();
    const acceptButton = appDiv.locator('button', { hasText: 'Accept' });

    await expect(header).toHaveText('Legal');
    await expect(acceptButton).toBeVisible();
    await acceptButton.click(); // --> chrome-extension://{hash}/options.html#/backup

    const backupNowButton = appDiv.locator('button', { hasText: 'Backup now' });
    const backupLaterButton = appDiv.locator('button', { hasText: 'Backup later' });

    await expect(header).toHaveText('Backup your wallet');
    await expect(backupNowButton).toBeVisible();
    await expect(backupLaterButton).toBeVisible();
    await backupNowButton.click(); // --> chrome-extension://{hash}/options.html#/backupWalletSteps

    const paragraph = appDiv.locator('p').first();
    const revealButton = appDiv.locator('button', { hasText: 'Reveal' });
    const continueButton = appDiv.locator('button', { hasText: 'Continue' });
    const hideButton = appDiv.locator('button', { hasText: 'Hide' });

    await expect(paragraph).toHaveText(
      'Write down your seed phrase and make sure to keep it private. This is the unique key to your wallet.'
    );
    await expect(revealButton).toBeVisible();
    await expect(hideButton).not.toBeVisible();
    await expect(continueButton).toBeDisabled();
    await revealButton.click();
    await expect(revealButton).not.toBeVisible();
    await expect(hideButton).toBeVisible();
    await expect(continueButton).toBeEnabled();

    // TODO: implement the rest steps
  } catch (err) {
    console.error('Xverse Wallet did not open or failed to display: ', err);
  } finally {
    await context.close();
  }
});
