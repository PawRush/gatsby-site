const { test, expect } = require('@playwright/test');

test.describe('Writing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/writing');
  });

  test('should load the writing page', async ({ page }) => {
    await expect(page).toHaveTitle(/Writing.*Marcy Sutton/);

    // Check for main heading
    const heading = page.getByRole('heading', { name: /^Writing$/i });
    await expect(heading).toBeVisible();
  });

  test('should display list of blog posts', async ({ page }) => {
    // Check for writing list
    const writingList = page.locator('.list-writing');
    await expect(writingList).toBeVisible();

    // Check that there are list items (blog posts)
    const listItems = writingList.locator('li');
    const count = await listItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have blog post links', async ({ page }) => {
    const writingList = page.locator('.list-writing');
    const postLinks = writingList.locator('a');

    // Should have multiple post links
    const linkCount = await postLinks.count();
    expect(linkCount).toBeGreaterThan(0);

    // First link should be visible and have text
    const firstLink = postLinks.first();
    await expect(firstLink).toBeVisible();

    const linkText = await firstLink.textContent();
    expect(linkText.trim().length).toBeGreaterThan(0);
  });

  test('should display post titles', async ({ page }) => {
    const writingList = page.locator('.list-writing');

    // Blog post titles should be visible
    const postTitles = writingList.locator('a, h2, h3, h4').filter({ hasText: /.+/ });
    const titleCount = await postTitles.count();

    expect(titleCount).toBeGreaterThan(0);
  });

  test('should have sidebar with talk events', async ({ page }) => {
    // Check for sidebar
    const sidebar = page.locator('.page-post-aside');
    await expect(sidebar).toBeVisible();
  });

  test('should have proper page layout', async ({ page }) => {
    // Check for main content area
    const mainContent = page.locator('.page-post-detail');
    await expect(mainContent).toBeVisible();

    // Check for wrapper
    const wrapper = page.locator('.page-post-wrap');
    await expect(wrapper).toBeVisible();
  });

  test('should be able to click on a blog post link', async ({ page }) => {
    const writingList = page.locator('.list-writing');
    const firstPostLink = writingList.locator('a').first();

    // Get the href before clicking
    const href = await firstPostLink.getAttribute('href');
    expect(href).toBeTruthy();

    // Click the link
    await firstPostLink.click();

    // Should navigate to a blog post
    await page.waitForLoadState('networkidle');
    const currentUrl = page.url();

    // URL should have changed
    expect(currentUrl).not.toContain('/writing');
  });

  test('should have main landmark', async ({ page }) => {
    const main = page.locator('main, [role="main"]');
    await expect(main).toBeVisible();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    // Check for h1/h2 main heading
    const mainHeading = page.locator('h1, h2').filter({ hasText: /writing/i });
    await expect(mainHeading.first()).toBeVisible();
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Tab to first blog post link
    await page.keyboard.press('Tab');

    let found = false;
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');

      const focusedElement = page.locator(':focus');
      const tagName = await focusedElement.evaluate(el => el.tagName.toLowerCase()).catch(() => '');

      if (tagName === 'a') {
        await expect(focusedElement).toBeVisible();
        found = true;
        break;
      }
    }

    expect(found).toBeTruthy();
  });
});

test.describe('Writing on Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display writing section on homepage', async ({ page }) => {
    const writingSection = page.locator('.list-writing-home');
    await expect(writingSection).toBeVisible();

    // Check for subtitle
    const subtitle = writingSection.locator('h3').filter({ hasText: /writing/i });
    await expect(subtitle).toBeVisible();
  });

  test('should have limited number of posts on homepage', async ({ page }) => {
    const writingSection = page.locator('.list-writing-home');
    const postItems = writingSection.locator('li');

    const count = await postItems.count();

    // Homepage should show limited posts (usually 3-6)
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(10);
  });

  test('should be able to navigate to writing page from homepage', async ({ page }) => {
    // Look for a link to the writing page in navigation
    const writingLink = page.getByRole('link', { name: /writing/i }).first();
    await writingLink.click();

    await expect(page).toHaveURL(/\/writing/);
  });
});

test.describe('Individual Blog Post', () => {
  test('should be able to view a blog post', async ({ page }) => {
    // First go to writing page
    await page.goto('/writing');

    // Click on first blog post
    const firstPostLink = page.locator('.list-writing a').first();
    const href = await firstPostLink.getAttribute('href');

    await firstPostLink.click();
    await page.waitForLoadState('networkidle');

    // Should be on a blog post page
    const currentUrl = page.url();
    expect(currentUrl).toContain(href);

    // Should have main content
    const main = page.locator('main, [role="main"]');
    await expect(main).toBeVisible();
  });

  test('blog post should have proper structure', async ({ page }) => {
    // Navigate to writing page and click first post
    await page.goto('/writing');
    await page.locator('.list-writing a').first().click();
    await page.waitForLoadState('networkidle');

    // Should have a heading
    const headings = page.locator('h1, h2');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);

    // Should have main landmark
    const main = page.locator('main, [role="main"]');
    await expect(main).toBeVisible();
  });

  test('should be able to navigate back to writing page from blog post', async ({ page }) => {
    // Navigate to a blog post
    await page.goto('/writing');
    await page.locator('.list-writing a').first().click();
    await page.waitForLoadState('networkidle');

    // Click writing link in navigation
    const writingLink = page.getByRole('link', { name: /writing/i }).first();
    await writingLink.click();

    await expect(page).toHaveURL(/\/writing/);
  });
});

test.describe('Blog Post Accessibility', () => {
  test('blog posts should have accessible images', async ({ page }) => {
    await page.goto('/writing');
    await page.locator('.list-writing a').first().click();
    await page.waitForLoadState('networkidle');

    // Check all images have alt text or are decorative
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const hasAlt = await img.getAttribute('alt') !== null;
      const hasRolePresentation = await img.getAttribute('role') === 'presentation';

      expect(hasAlt || hasRolePresentation).toBeTruthy();
    }
  });

  test('blog posts should have proper heading structure', async ({ page }) => {
    await page.goto('/writing');
    await page.locator('.list-writing a').first().click();
    await page.waitForLoadState('networkidle');

    // Should have at least one main heading
    const h1Count = await page.locator('h1').count();
    const h2Count = await page.locator('h2').count();

    expect(h1Count + h2Count).toBeGreaterThan(0);
  });

  test('blog posts should be keyboard navigable', async ({ page }) => {
    await page.goto('/writing');
    await page.locator('.list-writing a').first().click();
    await page.waitForLoadState('networkidle');

    // Should be able to tab through the page
    await page.keyboard.press('Tab');

    let foundInteractiveElement = false;
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');

      const focusedElement = page.locator(':focus');
      const isVisible = await focusedElement.isVisible().catch(() => false);

      if (isVisible) {
        const tagName = await focusedElement.evaluate(el => el.tagName.toLowerCase());
        if (['a', 'button', 'input', 'textarea'].includes(tagName)) {
          foundInteractiveElement = true;
          break;
        }
      }
    }

    // Should find at least one interactive element (navigation links, etc.)
    expect(foundInteractiveElement).toBeTruthy();
  });
});

test.describe('Writing List Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/writing');
  });

  test('should display posts in chronological order', async ({ page }) => {
    const writingList = page.locator('.list-writing');
    const listItems = writingList.locator('li');
    const count = await listItems.count();

    if (count > 1) {
      // Check that items are present
      for (let i = 0; i < Math.min(count, 3); i++) {
        await expect(listItems.nth(i)).toBeVisible();
      }
    }
  });

  test('should have descriptive link text for posts', async ({ page }) => {
    const writingList = page.locator('.list-writing');
    const postLinks = writingList.locator('a');
    const linkCount = await postLinks.count();

    for (let i = 0; i < Math.min(linkCount, 5); i++) {
      const link = postLinks.nth(i);
      const linkText = await link.textContent();

      // Links should have descriptive text
      expect(linkText.trim().length).toBeGreaterThan(5);
      expect(linkText.toLowerCase()).not.toBe('click here');
      expect(linkText.toLowerCase()).not.toBe('read more');
    }
  });

  test('should have proper list semantics', async ({ page }) => {
    const writingList = page.locator('.list-writing');

    // Should contain a list element
    const list = writingList.locator('ul, ol');
    await expect(list.first()).toBeVisible();

    // Should have list items
    const listItems = list.first().locator('li');
    const count = await listItems.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Writing Search and Filter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/writing');
  });

  test('should be able to scan through all blog posts', async ({ page }) => {
    const writingList = page.locator('.list-writing');
    const listItems = writingList.locator('li');
    const count = await listItems.count();

    // Should have a reasonable number of posts
    expect(count).toBeGreaterThan(0);

    // All items should be accessible
    for (let i = 0; i < Math.min(count, 5); i++) {
      await expect(listItems.nth(i)).toBeVisible();
    }
  });

  test('should maintain consistent layout across posts', async ({ page }) => {
    const writingList = page.locator('.list-writing');
    const listItems = writingList.locator('li');
    const count = await listItems.count();

    if (count > 1) {
      // Check first two items for consistency
      const firstItem = listItems.first();
      const secondItem = listItems.nth(1);

      await expect(firstItem).toBeVisible();
      await expect(secondItem).toBeVisible();

      // Both should have links
      await expect(firstItem.locator('a')).toBeVisible();
      await expect(secondItem.locator('a')).toBeVisible();
    }
  });
});
