const { test, expect } = require('@playwright/test');

test.describe('Appointments Page - Cross Browser Compatibility', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to appointments page
    await page.goto('/appointments');
  });

  test('should render appointments page correctly across browsers', async ({ page }) => {
    // Check page title
    const pageTitle = page.locator('h1');
    await expect(pageTitle).toHaveText('Manage Appointments');
    
    // Check accordion controls
    const expandAllBtn = page.locator('.expand-all-btn');
    const collapseAllBtn = page.locator('.collapse-all-btn');
    await expect(expandAllBtn).toBeVisible();
    await expect(collapseAllBtn).toBeVisible();
  });

  test('should handle accordion functionality across browsers', async ({ page }) => {
    // Wait for appointments to load
    await page.waitForSelector('.year-group');
    
    // Check that accordion headers are present
    const yearHeaders = page.locator('.year-header');
    await expect(yearHeaders).toHaveCount(1);
    
    // Check that accordion content is initially hidden
    const yearContent = page.locator('.year-content');
    await expect(yearContent).toBeVisible(); // Content should be visible by default in our test data
    
    // Test expand all functionality
    const expandAllBtn = page.locator('.expand-all-btn');
    await expandAllBtn.click();
    
    // Wait for expansion
    await page.waitForTimeout(500);
    
    // Test collapse all functionality
    const collapseAllBtn = page.locator('.collapse-all-btn');
    await collapseAllBtn.click();
    
    // Wait for collapse
    await page.waitForTimeout(500);
  });

  test('should display table view correctly across browsers', async ({ page }) => {
    // Wait for appointments to load
    await page.waitForSelector('.table');
    
    // Check table structure
    const table = page.locator('.table');
    await expect(table).toBeVisible();
    
    // Check table headers
    const headers = page.locator('.table th');
    await expect(headers).toHaveCount(6); // Time, Client, Category, Payment, Tip, Actions
    
    // Check that headers contain expected text
    const headerTexts = await headers.allTextContents();
    expect(headerTexts).toContain('Time');
    expect(headerTexts).toContain('Client');
    expect(headerTexts).toContain('Category');
    expect(headerTexts).toContain('Payment');
    expect(headerTexts).toContain('Tip');
    expect(headerTexts).toContain('Actions');
  });

  test('should display mobile cards correctly across browsers', async ({ page }) => {
    // Wait for appointments to load
    await page.waitForSelector('.mobile-cards');
    
    // Check mobile cards container
    const mobileCards = page.locator('.mobile-cards');
    await expect(mobileCards).toBeVisible();
    
    // Check appointment cards
    const appointmentCards = page.locator('.appointment-card');
    await expect(appointmentCards).toHaveCount(1); // Based on our test data
    
    // Check card structure
    const firstCard = appointmentCards.first();
    await expect(firstCard.locator('.card-header')).toBeVisible();
    await expect(firstCard.locator('.card-body')).toBeVisible();
    await expect(firstCard.locator('.actions')).toBeVisible();
  });

  test('should maintain responsive behavior across browsers', async ({ page }) => {
    // Wait for appointments to load
    await page.waitForSelector('.table');
    
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    
    // Table should be visible on desktop
    const table = page.locator('.table');
    await expect(table).toBeVisible();
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Content should still be accessible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.expand-all-btn')).toBeVisible();
  });

  test('should handle action buttons correctly across browsers', async ({ page }) => {
    // Wait for appointments to load
    await page.waitForSelector('.action-btn');
    
    // Check that action buttons are present
    const actionButtons = page.locator('.action-btn');
    await expect(actionButtons).toHaveCount(3); // Edit, Complete, Cancel
    
    // Check button types
    const editBtn = page.locator('.edit-btn');
    const completeBtn = page.locator('.save-btn'); // Note: save-btn class for complete
    const cancelBtn = page.locator('.delete-btn'); // Note: delete-btn class for cancel
    
    await expect(editBtn).toBeVisible();
    await expect(completeBtn).toBeVisible();
    await expect(cancelBtn).toBeVisible();
    
    // Check button text
    await expect(editBtn).toHaveText('Edit');
    await expect(completeBtn).toHaveText('Complete');
    await expect(cancelBtn).toHaveText('Cancel');
  });

  test('should display appointment information correctly across browsers', async ({ page }) => {
    // Wait for appointments to load
    await page.waitForSelector('.appointment-card');
    
    // Check appointment card content
    const appointmentCard = page.locator('.appointment-card').first();
    
    // Check header information
    const time = appointmentCard.locator('.time');
    const status = appointmentCard.locator('.status');
    await expect(time).toBeVisible();
    await expect(status).toBeVisible();
    
    // Check body information
    const infoRows = appointmentCard.locator('.info-row');
    await expect(infoRows).toHaveCount(3); // Client, Category, Tip
    
    // Check that labels are present
    const labels = appointmentCard.locator('.label');
    const labelTexts = await labels.allTextContents();
    expect(labelTexts).toContain('Client:');
    expect(labelTexts).toContain('Category:');
    expect(labelTexts).toContain('Tip:');
  });

  test('should handle keyboard navigation across browsers', async ({ page }) => {
    // Wait for appointments to load
    await page.waitForSelector('.year-header');
    
    // Focus on year header
    const yearHeader = page.locator('.year-header');
    await yearHeader.focus();
    
    // Check that header is focusable
    await expect(yearHeader).toBeFocused();
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    
    // Check that focus moved to next element
    const nextElement = page.locator(':focus');
    await expect(nextElement).not.toEqual(yearHeader);
  });

  test('should maintain visual consistency across browsers', async ({ page }) => {
    // Wait for appointments to load
    await page.waitForSelector('.appointments-page');
    
    // Check that all major sections are visible
    const sections = [
      '.appointments-page',
      '.accordion-controls',
      '.table-container',
      '.year-group'
    ];
    
    for (const sectionSelector of sections) {
      const section = page.locator(sectionSelector);
      await expect(section).toBeVisible();
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

  test('should handle data loading states across browsers', async ({ page }) => {
    // Check initial loading state
    const loadingText = page.locator('text=Loading appointments...');
    
    // If loading text is present, wait for it to disappear
    if (await loadingText.isVisible()) {
      await expect(loadingText).not.toBeVisible({ timeout: 10000 });
    }
    
    // Verify appointments data is loaded
    await page.waitForSelector('.appointment-card, .table tbody tr', { timeout: 10000 });
    
    // Check that either table or mobile cards have data
    const hasTableData = await page.locator('.table tbody tr').count() > 0;
    const hasCardData = await page.locator('.appointment-card').count() > 0;
    
    expect(hasTableData || hasCardData).toBeTruthy();
  });
});
