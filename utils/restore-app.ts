import { Page } from 'playwright';

export interface LocalStorageItem {
  key: string;
  value: string;
}

export const WALLET_PRIVATE_DATA = {
  DISTINCT: process.env.DISTINCT,
  DEVICE: process.env.DEVICE,
  TOKEN: process.env.TOKEN,
  TRANSACTION: process.env.TRANSACTION,
};

export const mockWalletData: LocalStorageItem[] = [
  {
    key: `__mpq_${WALLET_PRIVATE_DATA.TOKEN}_ev`,
    value: '[]',
  },
  {
    key: `__mpq_${WALLET_PRIVATE_DATA.TOKEN}_pp`,
    value: '[]',
  },
  {
    key: `mp_${WALLET_PRIVATE_DATA.TOKEN}_mixpanel`,
    value: JSON.stringify({
      distinct_id: WALLET_PRIVATE_DATA.DISTINCT,
      $device_id: WALLET_PRIVATE_DATA.DEVICE,
      $initial_referrer: '$direct',
      $initial_referring_domain: '$direct',
      __mps: {},
      __mpso: {
        $initial_referrer: '$direct',
        $initial_referring_domain: '$direct',
      },
      __mpus: {},
      __mpa: {},
      __mpu: {},
      __mpr: [],
      __mpap: [],
      $user_id: WALLET_PRIVATE_DATA.DISTINCT,
    }),
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
    key: 'transactionHistory_tb1qhhz93zy9ltwkfrkn793qdmy4zfu225w3y2ea7k',
    value: JSON.stringify([
      {
        date: '2024-12-30T21:15:18.389Z',
        type: 'create',
        amount: 0.10096,
        amountUnit: 'BTC',
        status: 'Completed',
        healthFactorBefore: 320,
        healthStatusBefore: {
          statusColor: 'text-status-green-100',
          rangeColor: 'bg-status-green-100',
          status: 'Healthy',
        },
        transactionId: WALLET_PRIVATE_DATA.TRANSACTION,
        unitInVault: 2968.13,
        btcInVault: 0.10096,
      },
    ]),
  },
  {
    key: 'wallet-info',
    value: JSON.stringify(null),
  },
];

export const setLocalStorage = async (page: Page, items: LocalStorageItem[]) => {
  await page.evaluate((items) => {
    items.forEach(({ key, value }) => {
      localStorage.setItem(key, value);
    });
  }, items);
};

export const getLocalStorageItems = async (context: Page, keys: string[]) => {
  return await context.evaluate((keys) => {
    return keys.reduce((acc, key) => {
      acc[key] = localStorage.getItem(key);
      return acc;
    }, {} as Record<string, string | null>);
  }, keys);
};
