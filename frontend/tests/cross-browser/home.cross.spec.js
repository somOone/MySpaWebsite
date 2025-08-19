const { test, expect } = require('@playwright/test');

test.describe('Home Page - Cross Browser Compatibility', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
  });

  test('should render hero section correctly across browsers', async ({ page }) => {
    // Check hero section is visible
    const heroSection = page.locator('.hero-section');
    await expect(heroSection).toBeVisible();
    
    // Check hero title
    const heroTitle = page.locator('.hero-title');
    await expect(heroTitle).toHaveText('Welcome to Serenity Spa');
    
    // Check CTA button
    const ctaButton = page.locator('.cta-button');
    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toHaveText('Book New Appointment');
  });

  test('should display spa statistics correctly across browsers', async ({ page }) => {
    // Wait for stats to load
    await page.waitForSelector('.hero-stats-comprehensive');
    
    // Check current year stats section
    const currentYearSection = page.locator('.stats-period.current-year');
    await expect(currentYearSection).toBeVisible();
    
    // Check all time stats section
    const allTimeSection = page.locator('.stats-period.all-time');
    await expect(allTimeSection).toBeVisible();
    
    // Check that stats contain numbers
    const statNumbers = page.locator('.stat-number-compact');
    await expect(statNumbers).toHaveCount(6); // 3 for current year + 3 for all time
    
    // Verify at least some stats are loaded
    const firstStat = page.locator('.stat-number-compact').first();
    const statText = await firstStat.textContent();
    expect(parseInt(statText) >= 0).toBeTruthy();
  });

  test('should render features grid correctly across browsers', async ({ page }) => {
    // Check features grid
    const featuresGrid = page.locator('.features-grid');
    await expect(featuresGrid).toBeVisible();
    
    // Check feature cards
    const featureCards = page.locator('.feature-card');
    await expect(featureCards).toHaveCount(3);
    
    // Check first feature card content
    const firstCard = featureCards.first();
    await expect(firstCard.locator('.feature-title')).toBeVisible();
    await expect(firstCard.locator('.feature-description')).toBeVisible();
  });

  test('should maintain responsive behavior across browsers', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    
    const heroSection = page.locator('.hero-section');
    await expect(heroSection).toBeVisible();
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verify content is still accessible
    await expect(page.locator('.hero-title')).toBeVisible();
    await expect(page.locator('.cta-button')).toBeVisible();
  });
});
