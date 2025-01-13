import { test, expect, chromium } from '@playwright/test';
import path from 'path';

import { clickLaunchAppAndWaitForPage, getHeadless } from '../utils/launch-app';
import { getLocalStorageItems, keysToRetrieve, mockItemsToStore, setLocalStorage } from '../utils/restore-app';

test.beforeEach(async ({ page }) => {
  const ROOT_URL = process.env.ROOT_URL;

  if (!ROOT_URL) {
    throw new Error('ROOT_URL is not defined.');
  }

  await page.goto(ROOT_URL);
});

test('Restore app', async ({ page }) => {
  await setLocalStorage(page, mockItemsToStore);

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

  await setLocalStorage(extensionTab, mockItemsToStore);

  try {
    await extensionWindow.waitFor({ state: 'visible', timeout: 5000 });
    await expect(extensionWindow).toBeVisible();
    await expect(extensionWindow).toContainText('The Bitcoin wallet for everyone');

    const browserStorage = await getLocalStorageItems(page, keysToRetrieve);
    const extensionStorage = await getLocalStorageItems(extensionTab, keysToRetrieve);

    mockItemsToStore.forEach(({ key, value }) => {
      expect(browserStorage[key]).toBe(value);
      expect(extensionStorage[key]).toBe(value);
    });

    // TODO: implement the rest steps
  } catch (err) {
    console.error('Xverse Wallet did not open or failed to display: ', err);
  } finally {
    await context.close();
  }
});
