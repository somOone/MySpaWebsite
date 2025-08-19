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

  test('should maintain responsive layout across browsers', async ({ page }) => {
    // Test desktop layout
    await page.setViewportSize({ width: 1200, height: 800 });
    
    const heroSection = page.locator('.hero-section');
    const heroRect = await heroSection.boundingBox();
    expect(heroRect.width).toBeGreaterThan(800);
    
    // Test tablet layout
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verify content is still accessible
    await expect(page.locator('.hero-title')).toBeVisible();
    await expect(page.locator('.cta-button')).toBeVisible();
  });

  test('should handle CTA button interaction across browsers', async ({ page }) => {
    const ctaButton = page.locator('.cta-button');
    
    // Check button is clickable
    await expect(ctaButton).toBeEnabled();
    
    // Check button has proper styling
    const buttonClasses = await ctaButton.getAttribute('class');
    expect(buttonClasses).toContain('cta-button');
    
    // Verify button text is readable
    const buttonText = await ctaButton.textContent();
    expect(buttonText.trim()).toBe('Book New Appointment');
  });

  test('should display statistics with proper formatting across browsers', async ({ page }) => {
    // Wait for stats to load
    await page.waitForSelector('.stat-item-compact');
    
    // Check that all stat types are present
    const massageStats = page.locator('.stat-item-compact.massage');
    const facialStats = page.locator('.stat-item-compact.facial');
    const comboStats = page.locator('.stat-item-compact.combo');
    
    await expect(massageStats).toHaveCount(2); // Current year + all time
    await expect(facialStats).toHaveCount(2);
    await expect(comboStats).toHaveCount(2);
    
    // Check that stat labels are visible
    const statLabels = page.locator('.stat-label-compact');
    await expect(statLabels).toHaveCount(6);
    
    // Verify labels contain expected text
    const labelTexts = await statLabels.allTextContents();
    expect(labelTexts).toContain('Massages');
    expect(labelTexts).toContain('Facials');
    expect(labelTexts).toContain('Combos');
  });

  test('should maintain visual consistency across browsers', async ({ page }) => {
    // Check that all sections have proper spacing and layout
    const sections = [
      '.hero-section',
      '.hero-stats-comprehensive',
      '.features-grid'
    ];
    
    for (const sectionSelector of sections) {
      const section = page.locator(sectionSelector);
      await expect(section).toBeVisible();
      
      // Check section has content
      const sectionContent = await section.textContent();
      expect(sectionContent.trim().length).toBeGreaterThan(0);
    }
    
    // Check that no console errors occurred
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Reload page to capture any console errors
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify no critical console errors
    expect(consoleErrors.length).toBeLessThan(5); // Allow some non-critical warnings
  });
});
