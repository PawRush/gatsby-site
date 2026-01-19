const { test, expect } = require('@playwright/test');

test.describe('Writing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/writing');
  });

  test('should load the writing page', async ({ page }) => {
    await expect(page).toHaveTitle(/MarcySutton/);
    // Check for main content section
    const section = page.locator('.page-post-detail');
    await expect(section).toBeVisible();
  });

  test('should display list of blog posts', async ({ page }) => {
    const writingList = page.locator('.list-writing');
    await expect(writingList).toBeVisible();
    const listItems = writingList.locator('li');
    const count = await listItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have blog post links', async ({ page }) => {
    const writingList = page.locator('.list-writing');
    const postLinks = writingList.locator('a');
    const linkCount = await postLinks.count();
    expect(linkCount).toBeGreaterThan(0);
    await expect(postLinks.first()).toBeVisible();
  });

  test('should have proper page layout', async ({ page }) => {
    const mainContent = page.locator('.page-post-detail');
    await expect(mainContent).toBeVisible();
    const wrapper = page.locator('.page-post-wrap');
    await expect(wrapper).toBeVisible();
  });

  test('should have main landmark', async ({ page }) => {
    const main = page.locator('main, [role="main"]');
    await expect(main).toBeVisible();
  });

  test('should be keyboard navigable', async ({ page }) => {
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

test.describe('Individual Blog Post', () => {
  test('should be able to view a blog post', async ({ page }) => {
    await page.goto('/writing');
    const firstPostLink = page.locator('.list-writing a').first();
    const href = await firstPostLink.getAttribute('href');
    await firstPostLink.click();
    await expect(page).toHaveURL(new RegExp(href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  });

  test('blog post should have proper structure', async ({ page }) => {
    await page.goto('/writing');
    await page.locator('.list-writing a').first().click();
    const headings = page.locator('h1, h2');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);
    const main = page.locator('main, [role="main"]');
    await expect(main).toBeVisible();
  });
});
