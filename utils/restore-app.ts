import { Page } from 'playwright';

export interface LocalStorageItem {
  key: string;
  value: string;
}

export const WALLET_PRIVATE_DATA = {
  // browser
  DISTINCT: process.env.DISTINCT,
  DEVICE: process.env.DEVICE,
  TOKEN: process.env.TOKEN,
  TRANSACTION: process.env.TRANSACTION,
  TRANSACTION_HISTORY: process.env.TRANSACTION_HISTORY,
  // xverse extension
  XVERSE_FIRST: process.env.XVERSE_FIRST,
  XVERSE_SECOND: process.env.XVERSE_SECOND,
  XVERSE_DISTINCT: process.env.XVERSE_DISTINCT,
  XVERSE_DEVICE_1: process.env.XVERSE_DEVICE_1,
  XVERSE_DEVICE_2: process.env.XVERSE_DEVICE_2,
  XVERSE_ORIGIN: process.env.XVERSE_ORIGIN,
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

export const setLocalStorage = async (page: Page, items: LocalStorageItem[], origin?: string) => {
  if (origin) {
    await page.goto(origin);
  }

  await page.evaluate((items) => {
    items.forEach(({ key, value }) => {
      localStorage.setItem(key, value);
    });
  }, items);
};

const getLocalStorageItems = async (context: Page, keys: string[]) => {
  return await context.evaluate((keys) => {
    return keys.reduce((acc, key) => {
      acc[key] = localStorage.getItem(key);
      return acc;
    }, {} as Record<string, string | null>);
  }, keys);
};

export const getStorageData = async (page: Page, mockData: Array<{ key: string }>): Promise<Record<string, any>> => {
  const keys = mockData.map(({ key }) => key);

  return await getLocalStorageItems(page, keys);
};
