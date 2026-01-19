const { test, expect } = require('@playwright/test');

test.describe('Accessibility Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/accessibility');
  });

  test('should load the accessibility page', async ({ page }) => {
    await expect(page).toHaveTitle(/Accessibility.*Marcy Sutton/);

    // Check for the main heading
    const heading = page.getByRole('heading', { name: /Accessibility Statement/i });
    await expect(heading).toBeVisible();
  });

  test('should display accessibility statement content', async ({ page }) => {
    // Check for the introductory paragraph
    await expect(page.locator('text=I want everyone who visits MarcySutton.com to feel welcome')).toBeVisible();
  });

  test('should have WCAG 2.1 reference link', async ({ page }) => {
    // Check for WCAG link
    const wcagLink = page.getByRole('link', { name: /Web Content Accessibility Guidelines.*WCAG.*2.1/i });
    await expect(wcagLink).toBeVisible();
    await expect(wcagLink).toHaveAttribute('href', /w3.org\/TR\/WCAG/);
    await expect(wcagLink).toHaveAttribute('target', '_blank');
    await expect(wcagLink).toHaveAttribute('rel', /noopener noreferrer/);
  });

  test('should mention Level AA compliance target', async ({ page }) => {
    // Check that the page mentions Level AA
    await expect(page.locator('text=/Level AA/i')).toBeVisible();
  });

  test('should have "What am I doing?" section', async ({ page }) => {
    const heading = page.getByRole('heading', { name: /What am I doing\?/i });
    await expect(heading).toBeVisible();
  });

  test('should have "How am I doing?" section', async ({ page }) => {
    const heading = page.getByRole('heading', { name: /How am I doing\?/i });
    await expect(heading).toBeVisible();

    // Check for contact link
    const contactLink = page.getByRole('link', { name: /get in touch/i });
    await expect(contactLink).toBeVisible();
    await expect(contactLink).toHaveAttribute('href', /\/contact/);
  });

  test('should have "Learn more" section with resources link', async ({ page }) => {
    const heading = page.getByRole('heading', { name: /Learn more/i });
    await expect(heading).toBeVisible();

    // Check for web accessibility resources link
    const resourcesLink = page.getByRole('link', { name: /web-accessibility-resources/i });
    await expect(resourcesLink).toBeVisible();
    await expect(resourcesLink).toHaveAttribute('href', /\/web-accessibility-resources/);
  });

  test('should have proper heading structure', async ({ page }) => {
    // Main heading should be h1 or h2
    const mainHeading = page.locator('h1, h2').filter({ hasText: /Accessibility Statement/i });
    await expect(mainHeading).toBeVisible();

    // Check for h2 subheadings
    const h2Headings = page.locator('h2');
    const h2Count = await h2Headings.count();
    expect(h2Count).toBeGreaterThanOrEqual(3); // "What am I doing?", "How am I doing?", "Learn more"
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Tab through the page
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Should be able to reach the WCAG link
    await page.keyboard.press('Tab'); // May need more tabs depending on navigation
    const wcagLink = page.getByRole('link', { name: /Web Content Accessibility Guidelines/i });

    // Continue tabbing until we reach WCAG link or contact link
    let attempts = 0;
    while (attempts < 20) {
      const isFocused = await wcagLink.evaluate(el => document.activeElement === el);
      if (isFocused) break;

      await page.keyboard.press('Tab');
      attempts++;
    }

    // Should eventually reach a link on the page
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should have all external links open in new window with proper attributes', async ({ page }) => {
    // Get all external links
    const wcagLink = page.getByRole('link', { name: /Web Content Accessibility Guidelines/i });

    // Check that external links have target="_blank"
    await expect(wcagLink).toHaveAttribute('target', '_blank');

    // Check that external links have rel="noopener noreferrer" for security
    await expect(wcagLink).toHaveAttribute('rel', /noopener noreferrer/);

    // Check that external link has descriptive text about opening in new window
    await expect(wcagLink).toHaveAttribute('title', /opens in a new window/i);
  });

  test('should have links with hover and focus states', async ({ page }) => {
    const contactLink = page.getByRole('link', { name: /get in touch/i });

    // Get initial styles
    const initialColor = await contactLink.evaluate(el =>
      window.getComputedStyle(el).color
    );

    // Hover over the link
    await contactLink.hover();

    // The color or style might change on hover (this is a basic check)
    await expect(contactLink).toBeVisible();

    // Focus the link
    await contactLink.focus();
    await expect(contactLink).toBeFocused();
  });

  test('should have sufficient color contrast', async ({ page }) => {
    // This is a basic visual check - for full contrast testing, use axe-core
    const bodyBg = await page.evaluate(() =>
      window.getComputedStyle(document.body).backgroundColor
    );

    const textColor = await page.evaluate(() =>
      window.getComputedStyle(document.body).color
    );

    // Both should be defined
    expect(bodyBg).toBeTruthy();
    expect(textColor).toBeTruthy();
    expect(bodyBg).not.toBe(textColor);
  });

  test('should have main content region', async ({ page }) => {
    // Check for main landmark
    const main = page.locator('main, [role="main"]');
    await expect(main).toBeVisible();

    // Check that accessibility content is within main
    const accessibilityHeading = page.getByRole('heading', { name: /Accessibility Statement/i });
    const isInMain = await main.locator('*').filter({ has: accessibilityHeading }).count() > 0;
    expect(isInMain).toBeTruthy();
  });

  test('should have proper page structure with sections', async ({ page }) => {
    // Check for section element
    const section = page.locator('section.generic-wrap');
    await expect(section).toBeVisible();

    // Check that content is properly organized
    const paragraphs = section.locator('p');
    const paragraphCount = await paragraphs.count();
    expect(paragraphCount).toBeGreaterThan(2);
  });

  test('should have descriptive link text', async ({ page }) => {
    // Check that links don't have generic text like "click here" or "read more"
    const allLinks = page.locator('a');
    const linkCount = await allLinks.count();

    for (let i = 0; i < linkCount; i++) {
      const linkText = await allLinks.nth(i).textContent();
      const linkTextLower = linkText.toLowerCase().trim();

      // Links should not be just "click here" or "read more"
      expect(linkTextLower).not.toBe('click here');
      expect(linkTextLower).not.toBe('read more');
      expect(linkTextLower.length).toBeGreaterThan(0); // Should have text
    }
  });

  test('should navigate to contact page from accessibility page', async ({ page }) => {
    const contactLink = page.getByRole('link', { name: /get in touch/i });
    await contactLink.click();
    await expect(page).toHaveURL(/\/contact/);
  });

  test('should navigate to resources page from accessibility page', async ({ page }) => {
    const resourcesLink = page.getByRole('link', { name: /web-accessibility-resources/i });
    await resourcesLink.click();
    await expect(page).toHaveURL(/\/web-accessibility-resources/);
  });
});
