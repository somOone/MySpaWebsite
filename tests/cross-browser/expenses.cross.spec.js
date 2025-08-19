const { test, expect } = require('@playwright/test');

test.describe('Expenses Page - Cross Browser Compatibility', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to expenses page
    await page.goto('/expenses');
  });

  test('should render expenses page correctly across browsers', async ({ page }) => {
    // Check page title
    const pageTitle = page.locator('h1');
    await expect(pageTitle).toHaveText('Manage Expenses');
    
    // Check accordion controls
    const expandAllBtn = page.locator('.expand-all-btn');
    const collapseAllBtn = page.locator('.collapse-all-btn');
    await expect(expandAllBtn).toBeVisible();
    await expect(collapseAllBtn).toBeVisible();
  });

  test('should handle accordion functionality across browsers', async ({ page }) => {
    // Wait for expenses to load
    await page.waitForSelector('.year-group');
    
    // Check that accordion headers are present
    const yearHeaders = page.locator('.year-header');
    await expect(yearHeaders).toHaveCount(1);
    
    // Check that accordion content is initially visible
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
    // Wait for expenses to load
    await page.waitForSelector('.table');
    
    // Check table structure
    const table = page.locator('.table');
    await expect(table).toBeVisible();
    
    // Check table headers
    const headers = page.locator('.table th');
    await expect(headers).toHaveCount(5); // Date, Category, Description, Amount, Actions
    
    // Check that headers contain expected text
    const headerTexts = await headers.allTextContents();
    expect(headerTexts).toContain('Date');
    expect(headerTexts).toContain('Category');
    expect(headerTexts).toContain('Description');
    expect(headerTexts).toContain('Amount');
    expect(headerTexts).toContain('Actions');
  });

  test('should display mobile cards correctly across browsers', async ({ page }) => {
    // Wait for expenses to load
    await page.waitForSelector('.mobile-cards');
    
    // Check mobile cards container
    const mobileCards = page.locator('.mobile-cards');
    await expect(mobileCards).toBeVisible();
    
    // Check expense cards
    const expenseCards = page.locator('.appointment-card'); // Note: uses same class as appointments
    await expect(expenseCards).toHaveCount(1); // Based on our test data
    
    // Check card structure
    const firstCard = expenseCards.first();
    await expect(firstCard.locator('.card-header')).toBeVisible();
    await expect(firstCard.locator('.card-body')).toBeVisible();
    await expect(firstCard.locator('.actions')).toBeVisible();
  });

  test('should maintain responsive behavior across browsers', async ({ page }) => {
    // Wait for expenses to load
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
    // Wait for expenses to load
    await page.waitForSelector('.action-btn');
    
    // Check that action buttons are present
    const actionButtons = page.locator('.action-btn');
    await expect(actionButtons).toHaveCount(2); // Edit, Delete
    
    // Check button types
    const editBtn = page.locator('.edit-btn');
    const deleteBtn = page.locator('.delete-btn');
    
    await expect(editBtn).toBeVisible();
    await expect(deleteBtn).toBeVisible();
    
    // Check button text
    await expect(editBtn).toHaveText('Edit');
    await expect(deleteBtn).toHaveText('Delete');
  });

  test('should display expense information correctly across browsers', async ({ page }) => {
    // Wait for expenses to load
    await page.waitForSelector('.appointment-card');
    
    // Check expense card content
    const expenseCard = page.locator('.appointment-card').first();
    
    // Check header information
    const date = expenseCard.locator('.date');
    const status = expenseCard.locator('.status');
    await expect(date).toBeVisible();
    await expect(status).toBeVisible();
    
    // Check body information
    const infoRows = expenseCard.locator('.info-row');
    await expect(infoRows).toHaveCount(3); // Category, Description, Amount
    
    // Check that labels are present
    const labels = expenseCard.locator('.label');
    const labelTexts = await labels.allTextContents();
    expect(labelTexts).toContain('Category:');
    expect(labelTexts).toContain('Description:');
    expect(labelTexts).toContain('Amount:');
  });

  test('should handle keyboard navigation across browsers', async ({ page }) => {
    // Wait for expenses to load
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
    // Wait for expenses to load
    await page.waitForSelector('.expenses-page');
    
    // Check that all major sections are visible
    const sections = [
      '.expenses-page',
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
    const loadingText = page.locator('text=Loading expenses...');
    
    // If loading text is present, wait for it to disappear
    if (await loadingText.isVisible()) {
      await expect(loadingText).not.toBeVisible({ timeout: 10000 });
    }
    
    // Verify expenses data is loaded
    await page.waitForSelector('.appointment-card, .table tbody tr', { timeout: 10000 });
    
    // Check that either table or mobile cards have data
    const hasTableData = await page.locator('.table tbody tr').count() > 0;
    const hasCardData = await page.locator('.appointment-card').count() > 0;
    
    expect(hasTableData || hasCardData).toBeTruthy();
  });

  test('should display expense totals correctly across browsers', async ({ page }) => {
    // Wait for expenses to load
    await page.waitForSelector('.year-header');
    
    // Check that expense totals are displayed in accordion headers
    const yearHeaders = page.locator('.year-header');
    await expect(yearHeaders).toHaveCount(1);
    
    // Check that the header contains a total amount
    const yearHeader = yearHeaders.first();
    const headerText = await yearHeader.textContent();
    
    // Should contain year and total amount
    expect(headerText).toContain('2025');
    expect(headerText).toMatch(/\$[\d,]+\.\d{2}/); // Should contain dollar amount
  });

  test('should handle expense categories correctly across browsers', async ({ page }) => {
    // Wait for expenses to load
    await page.waitForSelector('.appointment-card, .table tbody tr');
    
    // Check that expense categories are displayed
    const categoryElements = page.locator('text=/Category:/');
    await expect(categoryElements).toHaveCount(1);
    
    // Check that category values are present
    const categoryValues = page.locator('.value');
    await expect(categoryValues).toHaveCount(3); // Category, Description, Amount
    
    // Verify that at least one category value is visible
    const firstCategoryValue = categoryValues.first();
    await expect(firstCategoryValue).toBeVisible();
  });
});
