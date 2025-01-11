import { expect } from '@playwright/test';

export const clickLaunchAppAndWaitForPage = async (page: any) => {
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

export const getHeadless = (CI: string | undefined) => {
  return CI === 'true' || CI === undefined;
};
