# Playwright Tests for Marcy Sutton's Gatsby Portfolio

This directory contains comprehensive end-to-end tests using Playwright for the Gatsby portfolio site.

## Test Coverage

### 1. Homepage and Navigation (`homepage-navigation.spec.js`)
- Homepage loading and basic content
- Skip links and accessibility navigation
- Main navigation functionality
- Page sections (writing, talks, photos)
- Heading hierarchy
- Image alt text
- Landmark regions

### 2. Accessibility Page (`accessibility-page.spec.js`)
- Accessibility statement content
- WCAG 2.1 references
- Level AA compliance information
- Contact and resource links
- External link security attributes
- Keyboard navigation
- Link descriptions

### 3. Services and Talks (`services-talks.spec.js`)
- Services page content and layout
- Specialties and work history
- Training resources sidebar
- Talks page with video elements
- Accessible video iframes
- Cross-page navigation
- Semantic structure

### 4. Writing and Blog (`writing-blog.spec.js`)
- Writing page listing
- Blog post links and titles
- Individual blog post structure
- Navigation between pages
- Accessible images in posts
- Heading structure in posts
- List semantics

### 5. Responsive Design and Accessibility (`responsive-accessibility.spec.js`)
- Mobile, tablet, and desktop viewports
- Responsive navigation
- Image responsiveness
- Touch target sizes
- Text readability and zoom
- Axe accessibility audits (WCAG 2.0 Level AA)
- Keyboard navigation throughout site
- Color contrast
- Screen reader support
- ARIA landmarks
- Page titles
- Performance and loading

## Running the Tests

### Prerequisites

1. Install dependencies (including Playwright):
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

### Start the Dev Server

The tests require the Gatsby dev server to be running. Due to Node.js version compatibility, use:

```bash
NODE_OPTIONS=--openssl-legacy-provider npm run develop
```

Or the server will be started automatically by the Playwright config.

### Run Tests

Run all tests:
```bash
npm test
```

Run tests in a specific browser:
```bash
npm run test:chromium
```

Run tests in headed mode (see browser):
```bash
npm run test:headed
```

Run tests in debug mode:
```bash
npm run test:debug
```

Run specific test file:
```bash
npx playwright test homepage-navigation.spec.js
```

Run specific test:
```bash
npx playwright test homepage-navigation.spec.js:8
```

## Test Configuration

The tests are configured in `playwright.config.js` with:

- Base URL: `http://localhost:8000`
- Projects: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- Screenshots on failure
- Trace on first retry
- HTML reporter

## Accessibility Testing

The tests include automated accessibility testing using `@axe-core/playwright` which checks for:

- WCAG 2.0 Level A and AA violations
- WCAG 2.1 Level A and AA violations
- Color contrast
- Keyboard navigation
- ARIA usage
- Semantic HTML
- Form labels
- Image alt text
- Link text
- And more...

## Key Features Tested

### Accessibility Features
- Skip links (skip to main content, skip to top)
- Keyboard navigation
- Focus management
- Screen reader support
- ARIA landmarks and labels
- Semantic HTML structure
- Alt text for images
- Descriptive link text
- External link security attributes

### Responsive Design
- Mobile (375x667)
- Tablet (768x1024)
- Desktop (1920x1080)
- Touch target sizes
- Text scalability
- Image responsiveness

### User Experience
- Navigation consistency
- Page loading
- Link functionality
- Content visibility
- Layout structure

## Common Issues

### OpenSSL Error
If you see `error:0308010C:digital envelope routines::unsupported`, use the legacy OpenSSL provider:
```bash
NODE_OPTIONS=--openssl-legacy-provider npm run develop
```

### Port Already in Use
If port 8000 is already in use:
```bash
lsof -ti:8000 | xargs kill -9
```

### Playwright Browser Installation
If browsers aren't installed:
```bash
npx playwright install
```

## Test Reports

After running tests, view the HTML report:
```bash
npx playwright show-report
```

## Writing New Tests

Tests follow the Playwright Test framework conventions:

```javascript
const { test, expect } = require('@playwright/test');

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/page-url');
  });

  test('should do something', async ({ page }) => {
    // Test implementation
    await expect(page.locator('selector')).toBeVisible();
  });
});
```

## Continuous Integration

For CI environments, tests will:
- Run with 1 worker (sequential)
- Retry failed tests up to 2 times
- Fail if `test.only` is found
- Not reuse existing dev server

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Axe Accessibility Testing](https://github.com/dequelabs/axe-core)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Gatsby Testing](https://www.gatsbyjs.com/docs/how-to/testing/)
