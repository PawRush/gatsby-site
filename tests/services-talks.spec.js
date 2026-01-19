const { test, expect } = require('@playwright/test');

test.describe('Services Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/services');
  });

  test('should load the services page', async ({ page }) => {
    await expect(page).toHaveTitle(/MarcySutton/);
    const heading = page.getByRole('heading', { level: 2 }).first();
    await expect(heading).toBeVisible();
  });

  test('should display specialties section', async ({ page }) => {
    const heading = page.getByRole('heading', { name: /specialties/i });
    await expect(heading).toBeVisible();
  });

  test('should have proper page layout with main content and sidebar', async ({ page }) => {
    const mainContent = page.locator('.page-post-detail');
    await expect(mainContent).toBeVisible();
    const sidebar = page.locator('.page-post-aside');
    await expect(sidebar).toBeVisible();
  });
});

test.describe('Talks Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/talks');
  });

  test('should load the talks page', async ({ page }) => {
    await expect(page).toHaveTitle(/MarcySutton/);
    // Check for main content section
    const section = page.locator('.talks-wrap');
    await expect(section).toBeVisible();
  });

  test('should display introductory text', async ({ page }) => {
    await expect(page.locator('text=I love public speaking')).toBeVisible();
  });

  test('should display talks media grid', async ({ page }) => {
    const mediaGrid = page.locator('.media-grid-talks');
    await expect(mediaGrid).toBeVisible();
  });

  test('should have main landmark', async ({ page }) => {
    const main = page.locator('main, [role="main"]');
    await expect(main).toBeVisible();
  });
});

test.describe('Talks on Homepage', () => {
  test('should display talks section on homepage', async ({ page }) => {
    await page.goto('/');
    const talksSection = page.locator('section[aria-label="talks"]');
    await expect(talksSection).toBeVisible();
  });
});
