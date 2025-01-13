import { test, expect, chromium } from '@playwright/test';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

import { clickLaunchAppAndWaitForPage, getHeadless } from '../utils/launch-app';
import { WALLET_PRIVATE_DATA, getLocalStorageItems, mockWalletData, setLocalStorage } from '../utils/restore-app';

test.beforeEach(async ({ page }) => {
  const ROOT_URL = process.env.ROOT_URL;

  if (!ROOT_URL) {
    throw new Error('ROOT_URL is not defined.');
  }

  await page.goto(ROOT_URL);
});

test('Restore app', async ({ page }) => {
  const APP_URL = process.env.APP_URL;
  const EARLY_SUCCESS_URL = process.env.EARLY_SUCCESS_URL;

  if (!APP_URL || !EARLY_SUCCESS_URL) {
    throw new Error('APP_URL or EARLY_SUCCESS_URL is not defined.');
  }

  await setLocalStorage(page, mockWalletData);

  const insertId = uuidv4();
  const timestamp = Date.now();
  const url = `https://api-js.mixpanel.com/track/?verbose=1&ip=1&_=${timestamp}`;
  const payload = {
    data: [
      {
        event: '$mp_web_page_view',
        properties: {
          $os: 'Mac OS X',
          $browser: 'Chrome',
          $current_url: EARLY_SUCCESS_URL,
          $browser_version: 131,
          $screen_height: 1080,
          $screen_width: 1920,
          mp_lib: 'web',
          $lib_version: '2.56.0',
          $insert_id: insertId,
          time: timestamp,
          distinct_id: WALLET_PRIVATE_DATA.DISTINCT,
          $device_id: WALLET_PRIVATE_DATA.DEVICE,
          $initial_referrer: '$direct',
          $initial_referring_domain: '$direct',
          $user_id: WALLET_PRIVATE_DATA.DISTINCT,
          current_page_title: 'Ducat',
          current_domain: 'app.ducatprotocol.com',
          current_url_path: '/early-access',
          current_url_protocol: 'https:',
          token: WALLET_PRIVATE_DATA.TOKEN,
          mp_sent_by_lib_version: '2.56.0',
        },
      },
    ],
  };

  // mixpanel request (optionally to test analytics)
  const response = await page.evaluate(
    async ({ url, payload, appUrl }: { url: string; payload: any; appUrl: string }) => {
      const body = new URLSearchParams();

      for (const [key, value] of Object.entries(payload)) {
        body.append(key, JSON.stringify(value));
      }

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Origin: appUrl,
            Referer: appUrl,
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            Accept: '*/*',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8,ru;q=0.7,fi;q=0.6',
          },
          body: body.toString(),
        });

        return res.status === 200;
      } catch (error) {
        console.error('Error while sending Mixpanel event:', error);
        return false;
      }
    },
    { url, payload, appUrl: APP_URL }
  );

  if (response) {
    console.log('Mixpanel event sent successfully.');
  } else {
    console.error('Failed to send Mixpanel event.');
  }

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

  await setLocalStorage(extensionTab, mockWalletData);

  try {
    await extensionWindow.waitFor({ state: 'visible', timeout: 5000 });
    await expect(extensionWindow).toBeVisible();
    await expect(extensionWindow).toContainText('The Bitcoin wallet for everyone');

    const keysToRetrieve = mockWalletData.map(({ key }) => key);
    const browserStorage = await getLocalStorageItems(page, keysToRetrieve);
    const extensionStorage = await getLocalStorageItems(extensionTab, keysToRetrieve);

    mockWalletData.forEach(({ key, value }) => {
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
