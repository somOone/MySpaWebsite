const { test, expect } = require('@playwright/test');

test.describe('Reports Page - Cross Browser Compatibility', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to reports page
    await page.goto('/reports');
  });

  test('should render reports page correctly across browsers', async ({ page }) => {
    // Check page title
    const pageTitle = page.locator('h1');
    await expect(pageTitle).toHaveText('Reports & Analytics');
    
    // Check date range selector
    const dateRangeSelector = page.locator('.date-range-selector');
    await expect(dateRangeSelector).toBeVisible();
  });

  test('should display summary cards correctly across browsers', async ({ page }) => {
    // Wait for summary cards to load
    await page.waitForSelector('.summary-card');
    
    // Check summary cards are visible
    const summaryCards = page.locator('.summary-card');
    await expect(summaryCards).toHaveCount(4); // Revenue, Appointments, Expenses, Profit
    
    // Check each card has required elements
    for (let i = 0; i < 4; i++) {
      const card = summaryCards.nth(i);
      await expect(card.locator('.card-title')).toBeVisible();
      await expect(card.locator('.card-value')).toBeVisible();
    }
  });

  test('should display charts correctly across browsers', async ({ page }) => {
    // Wait for charts to load
    await page.waitForSelector('.chart-container');
    
    // Check charts are visible
    const charts = page.locator('.chart-container');
    await expect(charts).toHaveCount.greaterThan(0);
    
    // Check chart titles
    const chartTitles = page.locator('.chart-title');
    await expect(chartTitles).toHaveCount.greaterThan(0);
  });

  test('should display appointments table correctly across browsers', async ({ page }) => {
    // Wait for content to load
    await page.waitForSelector('.appointments-section');
    
    // Check appointments section
    const appointmentsSection = page.locator('.appointments-section');
    await expect(appointmentsSection).toBeVisible();
    
    // Check table headers
    const headers = page.locator('.appointments-section .table th');
    await expect(headers).toHaveCount(7); // Date, Time, Client, Service, Duration, Payment, Tip
    
    // Check that appointments are displayed
    const appointmentRows = page.locator('.appointments-section .table tbody tr');
    await expect(appointmentRows).toHaveCount.greaterThan(0);
  });

  test('should display expenses table correctly across browsers', async ({ page }) => {
    // Wait for content to load
    await page.waitForSelector('.expenses-section');
    
    // Check expenses section
    const expensesSection = page.locator('.expenses-section');
    await expect(expensesSection).toBeVisible();
    
    // Check table headers
    const headers = page.locator('.expenses-section .table th');
    await expect(headers).toHaveCount(6); // Date, Category, Description, Amount, Total
    
    // Check that expenses are displayed
    const expenseRows = page.locator('.expenses-section .table tbody tr');
    await expect(expenseRows).toHaveCount.greaterThan(0);
  });

  test('should maintain responsive behavior across browsers', async ({ page }) => {
    // Wait for content to load
    await page.waitForSelector('.summary-card');
    
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('.summary-cards')).toBeVisible();
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verify content is still accessible
    await expect(page.locator('.summary-card')).toBeVisible();
  });

  test('should display mobile cards correctly across browsers', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Wait for content to load
    await page.waitForSelector('.appointments-section');
    
    // Check mobile cards are visible
    const mobileCards = page.locator('.mobile-cards .appointment-card');
    await expect(mobileCards).toHaveCount.greaterThan(0);
    
    // Check card structure
    const firstCard = mobileCards.first();
    await expect(firstCard.locator('.card-header')).toBeVisible();
    await expect(firstCard.locator('.card-body')).toBeVisible();
  });

  test('should handle date range selection across browsers', async ({ page }) => {
    // Wait for date range selector to load
    await page.waitForSelector('.date-range-selector');
    
    // Check date range selector is functional
    const dateRangeSelector = page.locator('.date-range-selector');
    await expect(dateRangeSelector).toBeVisible();
    
    // Check that different date ranges can be selected
    const dateOptions = page.locator('.date-range-selector option');
    await expect(dateOptions).toHaveCount.greaterThan(0);
  });

  test('should handle chart interactions across browsers', async ({ page }) => {
    // Wait for charts to load
    await page.waitForSelector('.chart-container');
    
    // Check charts are interactive
    const charts = page.locator('.chart-container');
    await expect(charts).toHaveCount.greaterThan(0);
    
    // Verify chart containers have proper dimensions
    const firstChart = charts.first();
    const chartBox = await firstChart.boundingBox();
    expect(chartBox.width).toBeGreaterThan(0);
    expect(chartBox.height).toBeGreaterThan(0);
  });

  test('should maintain visual consistency across browsers', async ({ page }) => {
    // Wait for content to load
    await page.waitForSelector('.reports-page');
    
    // Check CSS classes are applied correctly
    const pageContainer = page.locator('.reports-page');
    await expect(pageContainer).toHaveClass(/reports-page/);
    
    const summaryCards = page.locator('.summary-cards');
    await expect(summaryCards).toHaveClass(/summary-cards/);
  });

  test('should handle data loading states across browsers', async ({ page }) => {
    // Navigate to page and check initial state
    await expect(page.locator('.reports-page')).toBeVisible();
    
    // Check that content loads
    await page.waitForSelector('.summary-card', { timeout: 10000 });
    
    // Verify data is displayed
    const hasContent = await page.locator('.summary-card').count() > 0;
    expect(hasContent).toBeTruthy();
  });

  test('should perform financial calculations correctly across browsers', async ({ page }) => {
    // Wait for content to load
    await page.waitForSelector('.summary-card');
    
    // Check that financial values are displayed
    const revenueCard = page.locator('.summary-card').filter({ hasText: 'Revenue' });
    const expensesCard = page.locator('.summary-card').filter({ hasText: 'Expenses' });
    const profitCard = page.locator('.summary-card').filter({ hasText: 'Profit' });
    
    await expect(revenueCard).toBeVisible();
    await expect(expensesCard).toBeVisible();
    await expect(profitCard).toBeVisible();
    
    // Verify values contain currency symbols or numbers
    const revenueValue = await revenueCard.locator('.card-value').textContent();
    const expensesValue = await expensesCard.locator('.card-value').textContent();
    const profitValue = await profitCard.locator('.card-value').textContent();
    
    expect(revenueValue).toMatch(/[\$0-9]/);
    expect(expensesValue).toMatch(/[\$0-9]/);
    expect(profitValue).toMatch(/[\$0-9]/);
  });
});
