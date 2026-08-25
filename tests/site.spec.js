const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => { await page.goto('/'); });

test('page has core content and no horizontal overflow', async ({ page }) => {
  await expect(page).toHaveTitle(/Альтерна-Амур/);
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('#catalog')).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(overflow).toBeFalsy();
});

test('all internal anchor links point to existing targets', async ({ page }) => {
  const hrefs = await page.locator('a[href^="#"]').evaluateAll(nodes => [...new Set(nodes.map(a => a.getAttribute('href')))]);
  for (const href of hrefs) { if (href !== '#') await expect(page.locator(href)).toHaveCount(1); }
});

test('personal data consent exists, is explicit and unchecked by default', async ({ page }) => {
  const consent = page.locator('input[name="personal_data_consent"]');
  await expect(consent).toHaveCount(1);
  await expect(consent).not.toBeChecked();
  await expect(consent).toHaveAttribute('required', '');
  await expect(page.locator('a[href="privacy.html"]')).toHaveCount(2);
  await expect(page.locator('a[href="consent.html"]')).toHaveCount(2);
});

test('form cannot submit without personal data consent', async ({ page }) => {
  const form = page.locator('#request-form');
  await form.locator('input[name="name"]').fill('Тест');
  await form.locator('input[name="contact"]').fill('test@example.com');
  await form.locator('textarea[name="message"]').fill('Тестовая заявка');
  await form.locator('button[type="submit"]').click();
  await expect(page.locator('#form-note')).toHaveText('');
  await expect(form.locator('input[name="personal_data_consent"]')).not.toBeChecked();
});

test('form passes only after explicit personal data consent', async ({ page }) => {
  const form = page.locator('#request-form');
  await form.locator('input[name="name"]').fill('Тест');
  await form.locator('input[name="contact"]').fill('test@example.com');
  await form.locator('textarea[name="message"]').fill('Тестовая заявка');
  await form.locator('input[name="personal_data_consent"]').check();
  await form.locator('button[type="submit"]').click();
  await expect(page.locator('#form-note')).toContainText('прошла проверку согласия');
});

test('mobile menu works', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile only');
  const toggle=page.locator('.menu-toggle'); const nav=page.locator('.main-nav');
  await toggle.click(); await expect(nav).toHaveClass(/open/);
  await nav.locator('a[href="#about"]').click(); await expect(nav).not.toHaveClass(/open/);
});

test('no mobile horizontal overflow', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile only');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1);
  expect(overflow).toBeFalsy();
});
