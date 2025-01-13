import { Page } from 'playwright';

export interface LocalStorageItem {
  key: string;
  value: string;
}

export const mockWalletData: LocalStorageItem[] = [
  {
    key: '__mpq_0377920f77b44d326f58fe2e73a0a764_ev',
    value: '[]',
  },
  {
    key: '__mpq_0377920f77b44d326f58fe2e73a0a764_pp',
    value: '[]',
  },
  {
    key: 'mp_0377920f77b44d326f58fe2e73a0a764_mixpanel',
    value: JSON.stringify({
      distinct_id: '02f0b708b747ba8db5e7b07f3bf75b758261e73d6dbca9678472d182cac2490b74',
      $device_id: '1941965c6b43ea-02d96da10d8c04-1e525636-1d73c0-1941965c6b53ea',
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
      $user_id: '02f0b708b747ba8db5e7b07f3bf75b758261e73d6dbca9678472d182cac2490b74',
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
        transactionId: '20d37e847f0e2259e454c159aa896de6903cc44842360e8f6a9349703d0fa915',
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
