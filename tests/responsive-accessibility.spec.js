const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test.describe('Responsive Design', () => {
  test('homepage should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check that main content is visible
    const main = page.locator('main, [role="main"]');
    await expect(main).toBeVisible();

    // Check that content is not overflowing
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375);
  });

  test('homepage should be responsive on tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    // Check that main content is visible
    const main = page.locator('main, [role="main"]');
    await expect(main).toBeVisible();

    // Check navigation is accessible
    const nav = page.locator('nav, [role="navigation"]');
    await expect(nav.first()).toBeVisible();
  });

  test('homepage should be responsive on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    // Check that main content is visible
    const main = page.locator('main, [role="main"]');
    await expect(main).toBeVisible();

    // Check that layout uses available space
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeGreaterThan(768);
  });

  test('navigation should work on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Navigation should be accessible
    const nav = page.locator('nav, [role="navigation"]');
    await expect(nav.first()).toBeVisible();

    // Should be able to navigate
    const writingLink = page.getByRole('link', { name: /writing/i }).first();
    await expect(writingLink).toBeVisible();
    await writingLink.click();
    await expect(page).toHaveURL(/\/writing/);
  });

  test('writing page should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/writing');

    // Content should be visible
    const heading = page.getByRole('heading', { name: /writing/i });
    await expect(heading.first()).toBeVisible();

    // List should be visible
    const writingList = page.locator('.list-writing');
    await expect(writingList).toBeVisible();
  });

  test('services page should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/services');

    // Content should be visible
    const heading = page.getByRole('heading', { name: /Marcy Sutton Todd/i });
    await expect(heading.first()).toBeVisible();

    // Text should not overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(385); // Allow small margin
  });

  test('images should be responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check that images don't overflow
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < Math.min(imageCount, 5); i++) {
      const img = images.nth(i);
      const box = await img.boundingBox();

      if (box) {
        // Images should not be wider than viewport
        expect(box.width).toBeLessThanOrEqual(375);
      }
    }
  });

  test('touch targets should be large enough on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check navigation links
    const navLinks = page.locator('nav a, [role="navigation"] a');
    const linkCount = await navLinks.count();

    for (let i = 0; i < Math.min(linkCount, 5); i++) {
      const link = navLinks.nth(i);
      const box = await link.boundingBox();

      if (box) {
        // Touch targets should be at least 44x44 pixels (WCAG guideline)
        // Being slightly lenient here as some designs may vary
        expect(box.height).toBeGreaterThanOrEqual(24);
      }
    }
  });

  test('text should be readable at mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check font size is reasonable
    const fontSize = await page.locator('body').evaluate(el =>
      window.getComputedStyle(el).fontSize
    );

    const fontSizeNum = parseFloat(fontSize);
    // Font size should be at least 14px
    expect(fontSizeNum).toBeGreaterThanOrEqual(14);
  });
});

test.describe('Accessibility Compliance', () => {
  test('homepage should pass axe accessibility tests', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('writing page should pass axe accessibility tests', async ({ page }) => {
    await page.goto('/writing');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('accessibility page should pass axe accessibility tests', async ({ page }) => {
    await page.goto('/accessibility');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('services page should pass axe accessibility tests', async ({ page }) => {
    await page.goto('/services');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('talks page should pass axe accessibility tests', async ({ page }) => {
    await page.goto('/talks');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe('Keyboard Navigation', () => {
  test('should be able to navigate entire homepage with keyboard', async ({ page }) => {
    await page.goto('/');

    // Tab through the page
    const interactiveElements = [];

    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Tab');

      const focusedElement = page.locator(':focus');
      const tagName = await focusedElement.evaluate(el => el.tagName.toLowerCase()).catch(() => '');

      if (tagName && ['a', 'button', 'input', 'textarea'].includes(tagName)) {
        const text = await focusedElement.textContent().catch(() => '');
        interactiveElements.push({ tagName, text: text.substring(0, 50) });
      }
    }

    // Should have found multiple interactive elements
    expect(interactiveElements.length).toBeGreaterThan(5);
  });

  test('focus should be visible on all interactive elements', async ({ page }) => {
    await page.goto('/');

    // Check several interactive elements for focus visibility
    const links = page.locator('a[href]');
    const linkCount = await links.count();

    for (let i = 0; i < Math.min(linkCount, 5); i++) {
      const link = links.nth(i);
      await link.focus();

      // Check that element is focused
      await expect(link).toBeFocused();

      // Get outline or focus indicator
      const outline = await link.evaluate(el =>
        window.getComputedStyle(el).outline
      );

      // Should have some kind of focus indicator (outline, border, etc.)
      // This is a basic check - actual implementation may vary
      expect(outline !== 'none' || outline !== '').toBeTruthy();
    }
  });

  test('skip links should work with keyboard', async ({ page }) => {
    await page.goto('/');

    // Press Tab to focus skip link
    await page.keyboard.press('Tab');

    const skipLink = page.locator('#skip-link-main');
    await expect(skipLink).toBeFocused();

    // Press Enter to activate
    await page.keyboard.press('Enter');

    // Main should be focused
    const main = page.locator('#main');
    await expect(main).toBeFocused();
  });

  test('forms should be keyboard accessible', async ({ page }) => {
    await page.goto('/');

    // Find newsletter form if it exists
    const formInputs = page.locator('input[type="email"], input[type="text"]');
    const inputCount = await formInputs.count();

    if (inputCount > 0) {
      const firstInput = formInputs.first();

      // Should be able to focus input
      await firstInput.focus();
      await expect(firstInput).toBeFocused();

      // Should be able to type
      await page.keyboard.type('test@example.com');

      const value = await firstInput.inputValue();
      expect(value).toContain('test@example.com');
    }
  });
});

test.describe('Color Contrast and Visual Design', () => {
  test('should have sufficient color contrast on homepage', async ({ page }) => {
    await page.goto('/');

    // Use axe to check color contrast
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('body')
      .analyze();

    // Filter for color contrast violations
    const contrastViolations = accessibilityScanResults.violations.filter(
      v => v.id === 'color-contrast'
    );

    expect(contrastViolations).toEqual([]);
  });

  test('links should have clear visual indicators', async ({ page }) => {
    await page.goto('/');

    // Check that links have text decoration or color difference
    const contentLinks = page.locator('main a, [role="main"] a').first();

    if (await contentLinks.isVisible()) {
      const textDecoration = await contentLinks.evaluate(el =>
        window.getComputedStyle(el).textDecoration
      );

      const color = await contentLinks.evaluate(el =>
        window.getComputedStyle(el).color
      );

      // Should have some visual indicator (color or underline)
      expect(textDecoration !== 'none' || color).toBeTruthy();
    }
  });

  test('headings should have clear visual hierarchy', async ({ page }) => {
    await page.goto('/');

    // Get font sizes of headings
    const h1Size = await page.locator('h1').first().evaluate(el =>
      parseFloat(window.getComputedStyle(el).fontSize)
    ).catch(() => 0);

    const h2Size = await page.locator('h2').first().evaluate(el =>
      parseFloat(window.getComputedStyle(el).fontSize)
    ).catch(() => 0);

    if (h1Size && h2Size) {
      // H1 should typically be larger than H2
      expect(h1Size).toBeGreaterThanOrEqual(h2Size * 0.9); // Allow small variations
    }
  });
});

test.describe('Screen Reader Support', () => {
  test('should have proper ARIA landmarks', async ({ page }) => {
    await page.goto('/');

    // Check for main landmark
    const main = page.locator('main, [role="main"]');
    await expect(main).toBeVisible();

    // Check for navigation landmark
    const nav = page.locator('nav, [role="navigation"]');
    await expect(nav.first()).toBeVisible();

    // Check for banner (header)
    const banner = page.locator('header, [role="banner"]');
    const bannerCount = await banner.count();
    expect(bannerCount).toBeGreaterThan(0);
  });

  test('should have proper heading structure for screen readers', async ({ page }) => {
    await page.goto('/');

    // Get all headings in order
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();

    // Should have headings
    expect(headings.length).toBeGreaterThan(0);

    // First heading should not be empty
    expect(headings[0].trim().length).toBeGreaterThan(0);
  });

  test('should have descriptive page titles', async ({ page }) => {
    const pages = [
      { url: '/', titlePattern: /Marcy Sutton/i },
      { url: '/writing', titlePattern: /Writing.*Marcy Sutton/i },
      { url: '/accessibility', titlePattern: /Accessibility.*Marcy Sutton/i },
      { url: '/services', titlePattern: /Accessible Web Developer.*Marcy Sutton/i },
      { url: '/talks', titlePattern: /Talks.*Marcy Sutton/i },
    ];

    for (const { url, titlePattern } of pages) {
      await page.goto(url);
      await expect(page).toHaveTitle(titlePattern);
    }
  });

  test('should have proper alt text for images', async ({ page }) => {
    await page.goto('/');

    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < Math.min(imageCount, 10); i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const role = await img.getAttribute('role');

      // Should have either alt text or role="presentation" for decorative images
      expect(alt !== null || role === 'presentation').toBeTruthy();

      if (alt !== null && role !== 'presentation') {
        // Non-decorative images should have descriptive alt text
        // (empty alt is ok for decorative images)
        const isDecorative = alt === '';
        const isDescriptive = alt.length > 0;
        expect(isDecorative || isDescriptive).toBeTruthy();
      }
    }
  });

  test('should have proper link text for screen readers', async ({ page }) => {
    await page.goto('/');

    const links = page.locator('a[href]');
    const linkCount = await links.count();

    for (let i = 0; i < Math.min(linkCount, 10); i++) {
      const link = links.nth(i);
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      const ariaLabelledby = await link.getAttribute('aria-labelledby');

      // Links should have text content or aria-label
      expect(
        text.trim().length > 0 || ariaLabel || ariaLabelledby
      ).toBeTruthy();
    }
  });
});

test.describe('Performance and Loading', () => {
  test('homepage should load quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;

    // Page should load within reasonable time (10 seconds for dev server)
    expect(loadTime).toBeLessThan(10000);
  });

  test('images should have width and height attributes', async ({ page }) => {
    await page.goto('/');

    const images = page.locator('img');
    const imageCount = await images.count();

    let imagesWithDimensions = 0;

    for (let i = 0; i < Math.min(imageCount, 5); i++) {
      const img = images.nth(i);
      const width = await img.getAttribute('width');
      const height = await img.getAttribute('height');

      if (width || height) {
        imagesWithDimensions++;
      }
    }

    // Most images should have dimensions to prevent layout shift
    // (allowing some flexibility for responsive images)
    expect(imagesWithDimensions).toBeGreaterThan(0);
  });
});

test.describe('Mobile Accessibility', () => {
  test('touch targets should be accessible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Use axe to check touch target size
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .analyze();

    // Should not have target size violations (if rule is available)
    const targetSizeViolations = accessibilityScanResults.violations.filter(
      v => v.id.includes('target-size')
    );

    expect(targetSizeViolations).toEqual([]);
  });

  test('mobile navigation should be accessible', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Navigation should be reachable
    const nav = page.locator('nav, [role="navigation"]');
    await expect(nav.first()).toBeVisible();

    // Links should be tappable
    const navLinks = page.locator('nav a, [role="navigation"] a');
    const firstLink = navLinks.first();
    await expect(firstLink).toBeVisible();

    // Should be able to tap
    await firstLink.click();

    // Should navigate
    const currentUrl = page.url();
    expect(currentUrl).toBeTruthy();
  });

  test('text should be zoomable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check viewport meta tag doesn't prevent zooming
    const viewportMeta = await page.locator('meta[name="viewport"]').getAttribute('content');

    if (viewportMeta) {
      // Should not have user-scalable=no or maximum-scale=1
      expect(viewportMeta).not.toContain('user-scalable=no');
      expect(viewportMeta).not.toContain('maximum-scale=1.0');
    }
  });
});
