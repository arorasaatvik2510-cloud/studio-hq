import { expect, test } from '@playwright/test';

const signIn = async (page: import('@playwright/test').Page) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: /Sign in to workspace/ })).toBeVisible();
  await page.getByRole('button', { name: /Sign in to workspace/ }).click();
  await expect(page.locator('.page-heading h1')).toHaveText('Security Vault.');
};

const openSection = async (page: import('@playwright/test').Page, name: string) => {
  const navigationItem = page.locator('.sidebar nav .nav-item').filter({ hasText: name });
  await expect(navigationItem).toBeVisible();
  await navigationItem.click();
  await expect(page.locator('.breadcrumb')).toContainText(name);
};

test('1. sign in and load the private project workspace', async ({ page }) => {
  await signIn(page);
  await expect(page.getByText(/Assigned keeper:/)).toContainText('The Archivist');
  await expect(page.getByRole('heading', { name: 'Security Vault', exact: true })).toBeVisible();
  await expect(page.getByLabel('Create vault passphrase')).toBeVisible();
  await openSection(page, 'Overview');
  await expect(page.getByRole('heading', { name: 'Your projects' })).toBeVisible();
  await expect(page.getByText('FernAlibi', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('The Hollow House', { exact: true }).first()).toBeVisible();
});

test('2. create, complete, and retain a workspace task after navigation', async ({ page }) => {
  await signIn(page);
  await openSection(page, 'Tasks');
  const taskTitle = 'Upload missing game artwork';
  await page.getByPlaceholder(/Add a follow-up/).fill(taskTitle);
  await page.getByRole('button', { name: 'Add task' }).click();
  const row = page.locator('.full-task').filter({ hasText: taskTitle });
  await expect(row).toBeVisible();
  await row.locator('button.task-check').click();
  await expect(row.getByText('Complete')).toBeVisible();
  await openSection(page, 'Overview');
  await openSection(page, 'Tasks');
  const retained = page.locator('.full-task').filter({ hasText: taskTitle });
  await expect(retained).toBeVisible();
  await expect(retained.getByText('Complete')).toBeVisible();
});

test('3. reject empty tasks and require authentication for task API access', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const unauthStatus = await page.evaluate(async () => {
    try {
      await window.__STUDIO_HQ_CI__!.api.get('/api/tasks');
      return 200;
    } catch (error) {
      return (error as Error & { status?: number }).status ?? 500;
    }
  });
  expect(unauthStatus).toBe(401);

  await page.getByRole('button', { name: /Sign in to workspace/ }).click();
  await expect(page.locator('.page-heading h1')).toContainText('Security Vault');
  await openSection(page, 'Tasks');
  await expect(page.getByRole('button', { name: 'Add task' })).toBeDisabled();
  await expect(page.locator('.tasks-panel')).toBeVisible();
});

test('4. verify launch links and the encrypted vault export/import guardrails', async ({ page }, testInfo) => {
  await signIn(page);
  await openSection(page, 'Links & Launches');
  await expect(page.getByRole('heading', { name: 'FernAlibi — current beta preview' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'The Hollow House: Seven Nights' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Pocketwise Expense Tracker — AppDeploy beta' })).toBeVisible();
  await expect(page.getByText('Pending · not verified')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'GitHub Pages settings' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'GitHub Actions workflows' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Expense Dashboard UI' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'AppDeploy dashboard' })).toBeVisible();

  await openSection(page, 'Security Vault');
  const passphrase = 'Studio-HQ-ci-passphrase-2026';
  await page.getByLabel('Create vault passphrase').fill(passphrase);
  await page.getByLabel('Confirm vault passphrase').fill(passphrase);
  await page.getByRole('button', { name: 'Create encrypted vault' }).click();
  await expect(page.getByText(/Encrypted workspace archive created/)).toBeVisible();

  await page.getByRole('button', { name: 'Seal current workspace' }).click();
  await expect(page.getByText(/sealed into a new encrypted snapshot/)).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download encrypted backup' }).click();
  const download = await downloadPromise;
  const archivePath = testInfo.outputPath(download.suggestedFilename());
  await download.saveAs(archivePath);

  await page.getByRole('button', { name: 'Lock vault' }).click();
  await page.getByLabel('Keeper identity').fill('Wrong keeper');
  await page.getByLabel('Vault passphrase').fill(passphrase);
  await page.getByRole('button', { name: 'Unlock vault' }).click();
  await expect(page.getByRole('status')).toContainText('Access denied');

  await page.getByLabel('Keeper identity').fill('The Archivist');
  await page.getByLabel('Vault passphrase').fill(passphrase);
  await page.getByRole('button', { name: 'Unlock vault' }).click();
  await expect(page.getByRole('status')).toContainText('Access granted to The Archivist');

  page.once('dialog', dialog => dialog.accept());
  await page.locator('input[type="file"]').setInputFiles(archivePath);
  await expect(page.getByRole('heading', { name: 'Encrypted archive opened' })).toBeVisible();
  await expect(page.getByText(/read-only archive preview/)).toBeVisible();
  await expect(page.getByText(/Live tasks were not modified/)).toBeVisible();
});

test('5. open Pocketwise from the workspace and verify the standalone fallback', async ({ page }) => {
  await page.route('https://pocketwise-expense-tracker-beta-gz9icz.v2.appdeploy.ai/**', route => route.abort());
  await signIn(page);
  await openSection(page, 'Pocketwise');
  await expect(page.getByRole('heading', { name: 'Make every rupee count.' })).toBeVisible();
  await expect(page.getByText(/browser storage on this device/)).toBeVisible();
  const frame = page.getByTitle('Pocketwise Expense Tracker Beta');
  await expect(frame).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open standalone app ↗' })).toHaveAttribute(
    'href',
    'https://pocketwise-expense-tracker-beta-gz9icz.v2.appdeploy.ai/'
  );
});
