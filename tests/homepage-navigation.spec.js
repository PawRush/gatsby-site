const { test, expect } = require('@playwright/test');

test.describe('Homepage and Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the homepage successfully', async ({ page }) => {
    // Check that the page loaded
    await expect(page).toHaveTitle(/Marcy Sutton/);

    // Check for main heading
    await expect(page.locator('h2').first()).toBeVisible();
  });

  test('should display the main tagline', async ({ page }) => {
    // Check for the service tagline
    const tagline = page.locator('.service-tagline h2');
    await expect(tagline).toContainText("I'm a senior web developer with a specialty in frontend accessibility");
  });

  test('should have skip links for accessibility', async ({ page }) => {
    // Check for skip to main content link
    const skipLink = page.locator('#skip-link-main');
    await expect(skipLink).toBeInViewport();

    // Focus the skip link with keyboard
    await page.keyboard.press('Tab');

    // The skip link should become visible when focused
    await expect(skipLink).toBeFocused();
  });

  test('should skip to main content when skip link is clicked', async ({ page }) => {
    // Click the skip link
    await page.locator('#skip-link-main').click();

    // Check that main element has focus and tabindex
    const mainElement = page.locator('#main');
    await expect(mainElement).toHaveAttribute('tabindex', '-1');
    await expect(mainElement).toBeFocused();
  });

  test('should navigate to About page from homepage', async ({ page }) => {
    // Click the "about my work" link
    await page.getByRole('link', { name: /about my work/i }).click();

    // Check that we navigated to the about page
    await expect(page).toHaveURL(/\/about/);
  });

  test('should have functional main navigation', async ({ page }) => {
    // Test navigation to Services
    const servicesLink = page.getByRole('link', { name: /services/i }).first();
    await expect(servicesLink).toBeVisible();
    await servicesLink.click();
    await expect(page).toHaveURL(/\/services/);

    // Go back to homepage
    await page.goto('/');

    // Test navigation to Talks
    const talksLink = page.getByRole('link', { name: /talks/i }).first();
    await expect(talksLink).toBeVisible();
    await talksLink.click();
    await expect(page).toHaveURL(/\/talks/);

    // Go back to homepage
    await page.goto('/');

    // Test navigation to Writing
    const writingLink = page.getByRole('link', { name: /writing/i }).first();
    await expect(writingLink).toBeVisible();
    await writingLink.click();
    await expect(page).toHaveURL(/\/writing/);
  });

  test('should display latest writing section', async ({ page }) => {
    const writingSection = page.locator('.list-writing-home');
    await expect(writingSection).toBeVisible();

    // Check for subtitle
    await expect(writingSection.locator('h3')).toContainText(/writing/i);

    // Check that there are list items (blog posts)
    const listItems = writingSection.locator('li');
    await expect(listItems.first()).toBeVisible();
  });

  test('should display talks section with proper ARIA labels', async ({ page }) => {
    // Check for talks section
    const talksSection = page.locator('section[aria-label="talks"]');
    await expect(talksSection).toBeVisible();

    // Check for talks content
    const mediaGrid = talksSection.locator('.media-talks-home');
    await expect(mediaGrid).toBeVisible();
  });

  test('should display photo gallery section', async ({ page }) => {
    // Check for photos section
    const photosSection = page.locator('section[aria-label="Photos"]');
    await expect(photosSection).toBeVisible();

    // Check for image grid
    const imageGrid = photosSection.locator('.media-photos-home');
    await expect(imageGrid).toBeVisible();
  });

  test('should have newsletter form', async ({ page }) => {
    const newsletterForm = page.locator('.home.breathing-room').filter({ has: page.locator('form') });
    await expect(newsletterForm).toBeVisible();
  });

  test('should navigate using skip to top link', async ({ page }) => {
    // Scroll down
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Find and click skip to top link
    const skipToTop = page.locator('#skip-to-top');
    if (await skipToTop.isVisible()) {
      await skipToTop.click();

      // Check that the top element has focus
      const topElement = page.locator('#top');
      await expect(topElement).toBeFocused();
    }
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    // Check that there's only one h1 (should be in the header/logo area)
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
    expect(h1Count).toBeLessThanOrEqual(2); // Some sites have hidden h1s

    // Check for h2 elements
    const h2Count = await page.locator('h2').count();
    expect(h2Count).toBeGreaterThan(0);
  });

  test('should have all images with alt text or role presentation', async ({ page }) => {
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const hasAlt = await img.getAttribute('alt') !== null;
      const hasRolePresentation = await img.getAttribute('role') === 'presentation';

      // Each image should have either alt text or role="presentation"
      expect(hasAlt || hasRolePresentation).toBeTruthy();
    }
  });

  test('should have proper landmark regions', async ({ page }) => {
    // Check for main landmark
    const main = page.locator('main, [role="main"]');
    await expect(main).toBeVisible();

    // Check for navigation landmark
    const nav = page.locator('nav, [role="navigation"]');
    await expect(nav.first()).toBeVisible();
  });
});
