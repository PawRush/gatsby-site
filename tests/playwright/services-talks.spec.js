const { test, expect } = require('@playwright/test');

test.describe('Services Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/services');
  });

  test('should load the services page', async ({ page }) => {
    await expect(page).toHaveTitle(/Marcy Sutton Todd.*Accessible Web Developer/);

    // Check for main heading
    const heading = page.getByRole('heading', { name: /Marcy Sutton Todd.*Accessible Web Developer/i });
    await expect(heading).toBeVisible();
  });

  test('should display employment status notice', async ({ page }) => {
    // Check for the notice about working full-time
    await expect(page.locator('text=working full-time as a frontend software engineer')).toBeVisible();

    // Check for Superpeer link
    const superpeerLink = page.getByRole('link', { name: /Superpeer/i }).first();
    await expect(superpeerLink).toBeVisible();
    await expect(superpeerLink).toHaveAttribute('href', /superpeer.com\/marcysutton/);
  });

  test('should display work history information', async ({ page }) => {
    // Check for work history content
    await expect(page.locator('text=/worked as an independent web developer/i')).toBeVisible();

    // Check for LinkedIn link
    const linkedInLink = page.getByRole('link', { name: /linkedin.com\/in\/marcysutton/i });
    await expect(linkedInLink).toBeVisible();
    await expect(linkedInLink).toHaveAttribute('href', /linkedin.com\/in\/marcysutton/);
  });

  test('should display specialties section', async ({ page }) => {
    // Check for specialties heading
    const heading = page.getByRole('heading', { name: /My specialties are:/i });
    await expect(heading).toBeVisible();

    // Check that specialties list exists
    const specialtiesList = page.locator('ul').filter({ has: page.locator('text=Web User Interface engineering') });
    await expect(specialtiesList).toBeVisible();

    // Check for specific specialties
    await expect(page.locator('text=Accessible data visualizations')).toBeVisible();
    await expect(page.locator('text=Design systems')).toBeVisible();
    await expect(page.locator('text=Manual and automated accessibility testing')).toBeVisible();
  });

  test('should have "How to get in touch" section', async ({ page }) => {
    const heading = page.getByRole('heading', { name: /How to get in touch/i });
    await expect(heading).toBeVisible();

    // Check for contact page link
    const contactLink = page.getByRole('link', { name: /marcysutton.com\/contact/i });
    await expect(contactLink).toBeVisible();
    await expect(contactLink).toHaveAttribute('href', /\/contact/);
  });

  test('should have audit note section', async ({ page }) => {
    const heading = page.getByRole('heading', { name: /A note about audits/i });
    await expect(heading).toBeVisible();

    // Check for recommendations to other services
    await expect(page.getByRole('link', { name: /Knowbility/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Level Access/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Deque Systems/i })).toBeVisible();
  });

  test('should have sidebar with training resources', async ({ page }) => {
    // Check for the "In the meantime..." heading
    const sidebarHeading = page.getByRole('heading', { name: /In the meantime/i });
    await expect(sidebarHeading).toBeVisible();

    // Check for TestingAccessibility.com link
    const testingAccessibilityLink = page.getByRole('link', { name: /TestingAccessibility.com/i });
    await expect(testingAccessibilityLink).toBeVisible();
    await expect(testingAccessibilityLink).toHaveAttribute('href', /testingaccessibility.com/);

    // Check for Frontend Masters link
    const frontendMastersLink = page.getByRole('link', { name: /Frontend Masters/i });
    await expect(frontendMastersLink).toBeVisible();
    await expect(frontendMastersLink).toHaveAttribute('href', /frontendmasters.com/);
  });

  test('should have relevant articles section in sidebar', async ({ page }) => {
    const heading = page.getByRole('heading', { name: /Some relevant articles/i });
    await expect(heading).toBeVisible();

    // Check for internal article links
    const outsiderLeverageLink = page.getByRole('link', { name: /Outsider Leverage.*Accessibility/i });
    await expect(outsiderLeverageLink).toBeVisible();

    const liveCodingLink = page.getByRole('link', { name: /Live Coding Accessibility/i });
    await expect(liveCodingLink).toBeVisible();
  });

  test('should have proper page layout with main content and sidebar', async ({ page }) => {
    // Check for main content area
    const mainContent = page.locator('.page-post-detail');
    await expect(mainContent).toBeVisible();

    // Check for sidebar
    const sidebar = page.locator('.page-post-aside');
    await expect(sidebar).toBeVisible();
  });

  test('should have external links with security attributes', async ({ page }) => {
    // Get Frontend Masters link as example
    const externalLink = page.getByRole('link', { name: /Frontend Masters/i });

    await expect(externalLink).toHaveAttribute('target', '_blank');
    await expect(externalLink).toHaveAttribute('rel', /noopener noreferrer/);
    await expect(externalLink).toHaveAttribute('title', /opens in a new window/i);
  });
});

test.describe('Talks Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/talks');
  });

  test('should load the talks page', async ({ page }) => {
    await expect(page).toHaveTitle(/Talks.*Marcy Sutton/);

    // Check for main heading
    const heading = page.getByRole('heading', { name: /^Talks$/i });
    await expect(heading).toBeVisible();
  });

  test('should display introductory text', async ({ page }) => {
    await expect(page.locator('text=I love public speaking')).toBeVisible();
  });

  test('should display talks media grid', async ({ page }) => {
    // Check for media grid
    const mediaGrid = page.locator('.media-grid-talks');
    await expect(mediaGrid).toBeVisible();
  });

  test('should have multiple talk entries', async ({ page }) => {
    // Check that there are multiple talk items
    const talkItems = page.locator('.media-grid-talks .media-item, .media-grid-talks li, .media-grid-talks article');
    const count = await talkItems.count();

    // Should have at least some talks listed
    expect(count).toBeGreaterThan(0);
  });

  test('should have video elements or iframes for talks', async ({ page }) => {
    // Talks should have either video elements or iframes (for embedded videos)
    const videos = page.locator('video, iframe');
    const videoCount = await videos.count();

    // Should have at least one video
    expect(videoCount).toBeGreaterThan(0);
  });

  test('should have accessible video elements', async ({ page }) => {
    // Check that videos have titles or aria-labels
    const iframes = page.locator('iframe');
    const iframeCount = await iframes.count();

    if (iframeCount > 0) {
      // Each iframe should have a title
      for (let i = 0; i < Math.min(iframeCount, 5); i++) {
        const iframe = iframes.nth(i);
        const title = await iframe.getAttribute('title');
        expect(title).toBeTruthy();
        expect(title.length).toBeGreaterThan(0);
      }
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Start tabbing through the page
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Continue tabbing to reach content
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');

      const focusedElement = page.locator(':focus');
      const isVisible = await focusedElement.isVisible().catch(() => false);

      if (isVisible) {
        const tagName = await focusedElement.evaluate(el => el.tagName.toLowerCase());
        // Should be able to focus on interactive elements
        expect(['a', 'button', 'iframe', 'video', 'input']).toContain(tagName);
        break;
      }
    }
  });

  test('should have proper semantic structure', async ({ page }) => {
    // Check for section element
    const section = page.locator('section.talks-wrap');
    await expect(section).toBeVisible();

    // Check for proper heading hierarchy
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
  });

  test('should have main landmark', async ({ page }) => {
    const main = page.locator('main, [role="main"]');
    await expect(main).toBeVisible();
  });
});

test.describe('Talks on Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display talks section on homepage', async ({ page }) => {
    // Check for talks section with aria-label
    const talksSection = page.locator('section[aria-label="talks"]');
    await expect(talksSection).toBeVisible();

    // Check for subtitle
    const subtitle = talksSection.locator('text=/spoken at some conferences/i');
    await expect(subtitle).toBeVisible();
  });

  test('should have talk items in homepage talks section', async ({ page }) => {
    const talksSection = page.locator('section[aria-label="talks"]');

    // Should have media grid
    const mediaGrid = talksSection.locator('.media-talks-home');
    await expect(mediaGrid).toBeVisible();
  });

  test('should be able to navigate to full talks page from homepage', async ({ page }) => {
    // Look for a link to the talks page
    const talksLink = page.getByRole('link', { name: /talks/i }).first();
    await talksLink.click();

    // Should navigate to talks page
    await expect(page).toHaveURL(/\/talks/);
  });
});

test.describe('Services and Talks Cross-page Navigation', () => {
  test('should navigate between services and talks pages', async ({ page }) => {
    // Start on services page
    await page.goto('/services');
    await expect(page).toHaveURL(/\/services/);

    // Navigate to talks via main navigation
    const talksLink = page.getByRole('link', { name: /talks/i }).first();
    await talksLink.click();
    await expect(page).toHaveURL(/\/talks/);

    // Navigate back to services
    const servicesLink = page.getByRole('link', { name: /services/i }).first();
    await servicesLink.click();
    await expect(page).toHaveURL(/\/services/);
  });

  test('should maintain accessibility features across page navigation', async ({ page }) => {
    // Check services page for skip link
    await page.goto('/services');
    let skipLink = page.locator('#skip-link-main');
    await expect(skipLink).toBeInViewport();

    // Check talks page for skip link
    await page.goto('/talks');
    skipLink = page.locator('#skip-link-main');
    await expect(skipLink).toBeInViewport();
  });
});
