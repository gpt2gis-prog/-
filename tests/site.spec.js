const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('page has core content and no horizontal overflow', async ({ page }) => {
  await expect(page).toHaveTitle(/Альтерна-Амур/);
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('#catalog')).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(overflow).toBeFalsy();
});

test('all internal anchor links point to existing targets', async ({ page }) => {
  const hrefs = await page.locator('a[href^="#"]').evaluateAll(nodes => [...new Set(nodes.map(a => a.getAttribute('href'))) ]);
  for (const href of hrefs) {
    if (href === '#') continue;
    await expect(page.locator(href)).toHaveCount(1);
  }
});

test('every visible CTA can navigate to its intended section', async ({ page, isMobile }) => {
  if (isMobile) {
    await page.locator('.menu-toggle').click();
    await expect(page.locator('.main-nav')).toHaveClass(/open/);
    await page.locator('.main-nav a[href="#catalog"]').click();
  } else {
    await page.locator('.main-nav a[href="#catalog"]').click();
  }
  await expect(page.locator('#catalog')).toBeInViewport();
  await page.locator('.catalog-card').first().locator('a[href="#request"]').click();
  await expect(page.locator('#request')).toBeInViewport();
});

test('mobile menu opens and closes correctly', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile only');
  const toggle = page.locator('.menu-toggle');
  const nav = page.locator('.main-nav');
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(nav).toHaveClass(/open/);
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await nav.locator('a[href="#about"]').click();
  await expect(nav).not.toHaveClass(/open/);
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('desktop navigation is visible', async ({ page, isMobile }) => {
  test.skip(isMobile, 'desktop only');
  await expect(page.locator('.main-nav')).toBeVisible();
  await expect(page.locator('.menu-toggle')).toBeHidden();
});

test('required form fields prevent empty submit', async ({ page }) => {
  await page.locator('#request-form button[type="submit"]').click();
  const invalid = await page.locator('#request-form :invalid').count();
  expect(invalid).toBeGreaterThan(0);
  await expect(page.locator('#form-note')).toHaveText('');
});

test('form submits only after required fields and consent are completed', async ({ page }) => {
  const form = page.locator('#request-form');
  await form.locator('input[name="name"]').fill('Тест');
  await form.locator('input[name="contact"]').fill('test@example.com');
  await form.locator('textarea[name="message"]').fill('Тестовая заявка');
  await form.locator('.consent input').check();
  await form.locator('button[type="submit"]').click();
  await expect(page.locator('#form-note')).toContainText('Форма готова');
});

test('interactive elements have usable mobile tap size where applicable', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile only');
  const buttons = page.locator('button, .button');
  for (let i = 0; i < await buttons.count(); i++) {
    const box = await buttons.nth(i).boundingBox();
    if (box) expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(44);
  }
});
