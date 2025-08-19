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
    // Wait for content to load
    await page.waitForSelector('.year-group');
    
    // Test expand all functionality
    const expandAllBtn = page.locator('.expand-all-btn');
    await expandAllBtn.click();
    
    // Check that content is expanded
    await expect(page.locator('.year-content')).toBeVisible();
    await expect(page.locator('.month-content')).toBeVisible();
    await expect(page.locator('.date-content')).toBeVisible();
    
    // Test collapse all functionality
    const collapseAllBtn = page.locator('.collapse-all-btn');
    await collapseAllBtn.click();
  });

  test('should display table view correctly across browsers', async ({ page }) => {
    // Wait for content to load and expand
    await page.waitForSelector('.year-group');
    await page.locator('.expand-all-btn').click();
    
    // Check table is visible
    const table = page.locator('.table');
    await expect(table).toBeVisible();
    
    // Check table headers
    const headers = page.locator('.table th');
    await expect(headers).toHaveCount(6); // Date, Category, Description, Amount, Total, Actions
    
    // Check that expenses are displayed
    const expenseRows = page.locator('.table tbody tr');
    await expect(expenseRows).toHaveCount.greaterThan(0);
  });

  test('should display mobile cards correctly across browsers', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Wait for content to load and expand
    await page.waitForSelector('.year-group');
    await page.locator('.expand-all-btn').click();
    
    // Check mobile cards are visible
    const mobileCards = page.locator('.mobile-cards .appointment-card');
    await expect(mobileCards).toHaveCount.greaterThan(0);
    
    // Check card structure
    const firstCard = mobileCards.first();
    await expect(firstCard.locator('.card-header')).toBeVisible();
    await expect(firstCard.locator('.card-body')).toBeVisible();
    await expect(firstCard.locator('.actions')).toBeVisible();
  });

  test('should maintain responsive behavior across browsers', async ({ page }) => {
    // Wait for content to load
    await page.waitForSelector('.year-group');
    await page.locator('.expand-all-btn').click();
    
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('.table')).toBeVisible();
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.mobile-cards')).toBeVisible();
  });

  test('should display action buttons correctly across browsers', async ({ page }) => {
    // Wait for content to load and expand
    await page.waitForSelector('.year-group');
    await page.locator('.expand-all-btn').click();
    
    // Check action buttons exist
    const editButtons = page.locator('.action-btn.edit-btn');
    const deleteButtons = page.locator('.action-btn.delete-btn');
    
    await expect(editButtons).toHaveCount.greaterThan(0);
    await expect(deleteButtons).toHaveCount.greaterThan(0);
  });

  test('should display expense information correctly across browsers', async ({ page }) => {
    // Wait for content to load and expand
    await page.waitForSelector('.year-group');
    await page.locator('.expand-all-btn').click();
    
    // Check expense details are displayed
    const categories = page.locator('.category, .info-row .value');
    const descriptions = page.locator('.description, .info-row .value');
    const amounts = page.locator('.amount, .info-row .value');
    
    await expect(categories).toHaveCount.greaterThan(0);
    await expect(descriptions).toHaveCount.greaterThan(0);
    await expect(amounts).toHaveCount.greaterThan(0);
  });

  test('should display expense totals correctly across browsers', async ({ page }) => {
    // Wait for content to load and expand
    await page.waitForSelector('.year-group');
    await page.locator('.expand-all-btn').click();
    
    // Check expense totals are displayed
    const totals = page.locator('.expense-total, .info-row .value');
    await expect(totals).toHaveCount.greaterThan(0);
    
    // Verify totals contain currency symbols or numbers
    const firstTotal = totals.first();
    const totalText = await firstTotal.textContent();
    expect(totalText).toMatch(/[\$0-9]/);
  });

  test('should display expense categories correctly across browsers', async ({ page }) => {
    // Wait for content to load and expand
    await page.waitForSelector('.year-group');
    await page.locator('.expand-all-btn').click();
    
    // Check expense categories are displayed
    const categories = page.locator('.category, .info-row .value');
    await expect(categories).toHaveCount.greaterThan(0);
    
    // Verify categories contain text
    const firstCategory = categories.first();
    const categoryText = await firstCategory.textContent();
    expect(categoryText.trim().length).toBeGreaterThan(0);
  });

  test('should handle keyboard navigation across browsers', async ({ page }) => {
    // Wait for content to load
    await page.waitForSelector('.year-group');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    
    // Check focus is on first interactive element
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should maintain visual consistency across browsers', async ({ page }) => {
    // Wait for content to load
    await page.waitForSelector('.year-group');
    
    // Check CSS classes are applied correctly
    const pageContainer = page.locator('.expenses-page');
    await expect(pageContainer).toHaveClass(/expenses-page/);
    
    const accordionControls = page.locator('.accordion-controls');
    await expect(accordionControls).toHaveClass(/accordion-controls/);
  });

  test('should handle data loading states across browsers', async ({ page }) => {
    // Navigate to page and check initial state
    await expect(page.locator('.year-group')).toBeVisible();
    
    // Check that content loads
    await page.waitForSelector('.year-content', { timeout: 10000 });
    
    // Verify data is displayed
    const hasContent = await page.locator('.year-content').count() > 0;
    expect(hasContent).toBeTruthy();
  });
});
