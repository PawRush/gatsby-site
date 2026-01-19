const { test, expect } = require('@playwright/test');

test.describe('Homepage and Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the homepage successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/MarcySutton/);
    await expect(page.locator('h2').first()).toBeVisible();
  });

  test('should display the main tagline', async ({ page }) => {
    const tagline = page.locator('.service-tagline h2');
    await expect(tagline).toContainText("frontend accessibility");
  });

  test('should have skip links for accessibility', async ({ page }) => {
    const skipLink = page.locator('#skip-link-main');
    await expect(skipLink).toBeAttached();
    await page.keyboard.press('Tab');
    await expect(skipLink).toBeFocused();
  });

  test('should navigate to About page from homepage', async ({ page }) => {
    await page.getByRole('link', { name: /about my work/i }).click();
    await expect(page).toHaveURL(/\/about/);
  });

  test('should have functional main navigation', async ({ page }) => {
    // Test navigation to Talks
    const talksLink = page.getByRole('link', { name: /talks/i }).first();
    await expect(talksLink).toBeVisible();
    await talksLink.click();
    await expect(page).toHaveURL(/\/talks/);

    // Test navigation to Writing
    await page.goto('/');
    const writingLink = page.getByRole('link', { name: /writing/i }).first();
    await expect(writingLink).toBeVisible();
    await writingLink.click();
    await expect(page).toHaveURL(/\/writing/);
  });

  test('should display talks section with proper ARIA labels', async ({ page }) => {
    const talksSection = page.locator('section[aria-label="talks"]');
    await expect(talksSection).toBeVisible();
    const mediaGrid = talksSection.locator('.media-talks-home');
    await expect(mediaGrid).toBeVisible();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
    const h2Count = await page.locator('h2').count();
    expect(h2Count).toBeGreaterThan(0);
  });

  test('should have proper landmark regions', async ({ page }) => {
    const main = page.locator('main, [role="main"]');
    await expect(main).toBeVisible();
    const nav = page.locator('nav, [role="navigation"]');
    await expect(nav.first()).toBeVisible();
  });
});
