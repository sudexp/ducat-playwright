import { test as base, chromium, type BrowserContext } from '@playwright/test';
import path from 'path';

import { getHeadless } from './helpers';
// import { setLocalStorage } from './restore-app';
// import { mockWalletData } from '../utils/restore-app';

// not currently in use --> https://playwright.dev/docs/chrome-extensions
export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  context: async ({}, use) => {
    const pathToExtension = path.join(__dirname, '../xverse/');
    const context = await chromium.launchPersistentContext('', {
      headless: getHeadless(process.env.CI),
      args: [`--disable-extensions-except=${pathToExtension}`, `--load-extension=${pathToExtension}`],
    });

    // const extensionPage = await context.waitForEvent('page');

    // await extensionPage.waitForSelector('body', { state: 'attached' });
    // await setLocalStorage(extensionPage, mockWalletData);

    await use(context);
    await context.close();
  },

  extensionId: async ({ context }, use) => {
    let [background] = context.serviceWorkers();

    if (!background) {
      background = await context.waitForEvent('serviceworker');
    }

    const extensionId = background.url().split('/')[2];

    await use(extensionId);
  },
});

export const expect = test.expect;
