import { Page } from 'playwright';

interface LocalStorageItem {
  key: string;
  value: string;
}

export const mockItemsToStore = [
  { key: 'user', value: 'Dima' },
  { key: 'theme', value: 'dark' },
  { key: 'language', value: 'en' },
];

export const keysToRetrieve = mockItemsToStore.map(({ key }) => key);

export const setLocalStorage = async (page, items: LocalStorageItem[]) => {
  await Promise.all(
    items.map(({ key, value }) =>
      page.evaluate(
        (key, value) => {
          localStorage.setItem(key, value);
        },
        { key, value }
      )
    )
  );
};

export const getLocalStorageItems = async (context: Page, keys: string[]) => {
  return await context.evaluate((keys) => {
    return keys.reduce((acc, key) => {
      acc[key] = localStorage.getItem(key);
      return acc;
    }, {} as Record<string, string | null>);
  }, keys);
};
