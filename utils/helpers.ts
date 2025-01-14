import { expect, type Page } from '@playwright/test';

import { LocalStorageItem, MixPanelPayload, WalletStorage } from './interfaces';

export const clickLaunchAppAndWaitForPage = async (page: any): Promise<Page> => {
  const launchButton = page.locator('p.framer-text', { hasText: 'Launch App' }).first();

  await expect(launchButton).toBeVisible();

  const [newPage] = await Promise.all([page.context().waitForEvent('page'), launchButton.click()]);
  const EARLY_SUCCESS_URL = process.env.EARLY_SUCCESS_URL;

  if (!EARLY_SUCCESS_URL) {
    throw new Error('EARLY_SUCCESS_URL is not defined');
  }

  await expect(newPage).toHaveURL(EARLY_SUCCESS_URL);

  return newPage;
};

export const getHeadless = (CI: string | undefined): boolean => {
  return CI === 'true';
};

export const WALLET_PRIVATE_DATA: WalletStorage = {
  // browser
  DISTINCT: process.env.DISTINCT as string,
  DEVICE: process.env.DEVICE as string,
  TOKEN: process.env.TOKEN as string,
  TRANSACTION: process.env.TRANSACTION as string,
  TRANSACTION_HISTORY: process.env.TRANSACTION_HISTORY as string,
  // xverse extension
  EXTENSION_ID: process.env.EXTENSION_ID as string,
  XVERSE_FIRST: process.env.XVERSE_FIRST as string,
  XVERSE_SECOND: process.env.XVERSE_SECOND as string,
  XVERSE_DISTINCT: process.env.XVERSE_DISTINCT as string,
  XVERSE_DEVICE_1: process.env.XVERSE_DEVICE_1 as string,
  XVERSE_DEVICE_2: process.env.XVERSE_DEVICE_2 as string,
  XVERSE_UNLOCK_PATH: process.env.XVERSE_UNLOCK_PATH as string,
};

export const mockWalletBrowserData: LocalStorageItem[] = [
  {
    key: `__mpq_${WALLET_PRIVATE_DATA.TOKEN}_ev`,
    value: '[]',
  },
  {
    key: `__mpq_${WALLET_PRIVATE_DATA.TOKEN}_pp`,
    value: '[]',
  },
  {
    key: 'sats-connect_defaultProvider',
    value: 'XverseProviders.BitcoinProvider',
  },
  {
    key: 'selectedNetwork',
    value: 'signet',
  },
  {
    key: `transactionHistory_${WALLET_PRIVATE_DATA.TRANSACTION_HISTORY}`,
    value: JSON.stringify([
      {
        amount: 0.10096,
        amountUnit: 'BTC',
        btcInVault: 0.10096,
        date: '2024-12-30T21:15:18.389Z',
        healthFactorBefore: 320,
        healthStatusBefore: {
          rangeColor: 'bg-status-green-100',
          status: 'Healthy',
          statusColor: 'text-status-green-100',
        },
        status: 'Completed',
        transactionId: WALLET_PRIVATE_DATA.TRANSACTION,
        type: 'create',
        unitInVault: 2968.13,
      },
    ]),
  },
  {
    key: 'wallet-info',
    value: JSON.stringify(null),
  },
  {
    key: `mp_${WALLET_PRIVATE_DATA.TOKEN}_mixpanel`,
    value: JSON.stringify({
      $device_id: WALLET_PRIVATE_DATA.DEVICE,
      $initial_referrer: '$direct',
      $initial_referring_domain: '$direct',
      $user_id: WALLET_PRIVATE_DATA.DISTINCT,
      distinct_id: WALLET_PRIVATE_DATA.DISTINCT,
      __mpa: {},
      __mpap: [],
      __mpr: [],
      __mps: {},
      __mpso: {
        $initial_referrer: '$direct',
        $initial_referring_domain: '$direct',
      },
      __mpu: {},
      __mpus: {},
    }),
  },
];

export const mockWalletExtentionData: LocalStorageItem[] = [
  {
    key: `__mp_opt_in_out_${WALLET_PRIVATE_DATA.XVERSE_FIRST}`,
    value: '1',
  },
  {
    key: `__mp_opt_in_out_${WALLET_PRIVATE_DATA.XVERSE_SECOND}`,
    value: '1',
  },
  {
    key: `__mpq_${WALLET_PRIVATE_DATA.XVERSE_FIRST}_ev`,
    value: '[]',
  },
  {
    key: `__mpq_${WALLET_PRIVATE_DATA.XVERSE_SECOND}_ev`,
    value: '[]',
  },
  {
    key: 'isTermsAccepted',
    value: 'true',
  },
  {
    key: 'migrated',
    value: 'true',
  },
  {
    key: `mp_${WALLET_PRIVATE_DATA.XVERSE_FIRST}_mixpanel`,
    value: JSON.stringify({
      $device_id: WALLET_PRIVATE_DATA.XVERSE_DEVICE_1,
      $initial_referrer: '$direct',
      $initial_referring_domain: '$direct',
      $user_id: WALLET_PRIVATE_DATA.XVERSE_DISTINCT,
      distinct_id: WALLET_PRIVATE_DATA.XVERSE_DISTINCT,
    }),
  },
  {
    key: `mp_${WALLET_PRIVATE_DATA.XVERSE_SECOND}_mixpanel`,
    value: JSON.stringify({
      $device_id: WALLET_PRIVATE_DATA.XVERSE_DEVICE_2,
      $initial_referrer: '$direct',
      $initial_referring_domain: '$direct',
      $user_id: WALLET_PRIVATE_DATA.XVERSE_DISTINCT,
      distinct_id: WALLET_PRIVATE_DATA.XVERSE_DISTINCT,
    }),
  },
];

export const setLocalStorage = async (page: Page, items: LocalStorageItem[], origin?: string): Promise<void> => {
  if (origin) {
    await page.addInitScript((items) => {
      items.forEach(({ key, value }) => {
        localStorage.setItem(key, value);
      });
    }, items);

    await page.goto(origin);
  } else {
    await page.evaluate((items) => {
      items.forEach(({ key, value }) => {
        localStorage.setItem(key, value);
      });
    }, items);
  }
};

const getLocalStorageItems = async (context: Page, keys: string[]): Promise<Record<string, string | null>> => {
  return await context.evaluate((keys) => {
    return keys.reduce((acc, key) => {
      acc[key] = localStorage.getItem(key);
      return acc;
    }, {} as Record<string, string | null>);
  }, keys);
};

export const getStorageData = async (page: Page, mockData: Array<{ key: string }>): Promise<Record<string, string | null>> => {
  const keys = mockData.map(({ key }) => key);

  return await getLocalStorageItems(page, keys);
};

export const getMixPanelPayload = (
  insertId: string,
  timestamp: string,
  EARLY_SUCCESS_URL: string,
  WALLET_PRIVATE_DATA: WalletStorage
): MixPanelPayload => {
  return {
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
};
