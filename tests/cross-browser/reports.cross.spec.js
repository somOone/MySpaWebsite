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
    const dateRangeSelector = page.locator('select');
    await expect(dateRangeSelector).toBeVisible();
  });

  test('should display summary cards correctly across browsers', async ({ page }) => {
    // Wait for summary cards to load
    await page.waitForSelector('.summary-card');
    
    // Check that summary cards are present
    const summaryCards = page.locator('.summary-card');
    await expect(summaryCards).toHaveCount(4); // Revenue, Appointments, Expenses, Profit
    
    // Check first summary card structure
    const firstCard = summaryCards.first();
    await expect(firstCard.locator('.summary-title')).toBeVisible();
    await expect(firstCard.locator('.summary-value')).toBeVisible();
    
    // Check that summary values are numbers
    const summaryValues = page.locator('.summary-value');
    for (let i = 0; i < await summaryValues.count(); i++) {
      const value = await summaryValues.nth(i).textContent();
      expect(value).toMatch(/[\d,]+\.?\d*/); // Should contain numbers
    }
  });

  test('should display charts correctly across browsers', async ({ page }) => {
    // Wait for charts to load
    await page.waitForSelector('.recharts-wrapper');
    
    // Check that charts are present
    const charts = page.locator('.recharts-wrapper');
    await expect(charts).toHaveCount(2); // Revenue chart and appointments chart
    
    // Check chart containers
    const chartContainers = page.locator('.chart-container');
    await expect(chartContainers).toHaveCount(2);
    
    // Verify charts have content
    for (let i = 0; i < await charts.count(); i++) {
      const chart = charts.nth(i);
      await expect(chart).toBeVisible();
      
      // Check that chart has some content (bars, lines, etc.)
      const chartContent = await chart.innerHTML();
      expect(chartContent.length).toBeGreaterThan(100);
    }
  });

  test('should display appointments table correctly across browsers', async ({ page }) => {
    // Wait for appointments table to load
    await page.waitForSelector('.appointments-table');
    
    // Check table structure
    const appointmentsTable = page.locator('.appointments-table');
    await expect(appointmentsTable).toBeVisible();
    
    // Check table headers
    const headers = page.locator('.appointments-table th');
    await expect(headers).toHaveCount(6); // Date, Client, Category, Payment, Tip, Status
    
    // Check that headers contain expected text
    const headerTexts = await headers.allTextContents();
    expect(headerTexts).toContain('Date');
    expect(headerTexts).toContain('Client');
    expect(headerTexts).toContain('Category');
    expect(headerTexts).toContain('Payment');
    expect(headerTexts).toContain('Tip');
    expect(headerTexts).toContain('Status');
  });

  test('should display expenses table correctly across browsers', async ({ page }) => {
    // Wait for expenses table to load
    await page.waitForSelector('.expenses-table');
    
    // Check table structure
    const expensesTable = page.locator('.expenses-table');
    await expect(expensesTable).toBeVisible();
    
    // Check table headers
    const headers = page.locator('.expenses-table th');
    await expect(headers).toHaveCount(5); // Date, Category, Description, Amount, Actions
    
    // Check that headers contain expected text
    const headerTexts = await headers.allTextContents();
    expect(headerTexts).toContain('Date');
    expect(headerTexts).toContain('Category');
    expect(headerTexts).toContain('Description');
    expect(headerTexts).toContain('Amount');
    expect(headerTexts).toContain('Actions');
  });

  test('should maintain responsive behavior across browsers', async ({ page }) => {
    // Wait for content to load
    await page.waitForSelector('.summary-card');
    
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    
    // Summary cards should be in a grid on desktop
    const summaryCards = page.locator('.summary-card');
    await expect(summaryCards).toBeVisible();
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Content should still be accessible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('select')).toBeVisible();
  });

  test('should handle date range selection across browsers', async ({ page }) => {
    // Wait for date range selector to load
    await page.waitForSelector('select');
    
    // Check that date range selector is functional
    const dateSelector = page.locator('select');
    await expect(dateSelector).toBeEnabled();
    
    // Check available options
    const options = page.locator('select option');
    await expect(options).toHaveCount(4); // This Week, This Month, This Year, All Time
    
    // Check option values
    const optionTexts = await options.allTextContents();
    expect(optionTexts).toContain('This Week');
    expect(optionTexts).toContain('This Month');
    expect(optionTexts).toContain('This Year');
    expect(optionTexts).toContain('All Time');
  });

  test('should display mobile cards correctly across browsers', async ({ page }) => {
    // Wait for content to load
    await page.waitForSelector('.mobile-cards');
    
    // Check mobile cards container
    const mobileCards = page.locator('.mobile-cards');
    await expect(mobileCards).toBeVisible();
    
    // Check that mobile cards are present for appointments
    const appointmentCards = page.locator('.mobile-cards .appointment-card');
    await expect(appointmentCards).toHaveCount(1); // Based on our test data
    
    // Check card structure
    const firstCard = appointmentCards.first();
    await expect(firstCard.locator('.card-header')).toBeVisible();
    await expect(firstCard.locator('.card-body')).toBeVisible();
  });

  test('should handle chart interactions across browsers', async ({ page }) => {
    // Wait for charts to load
    await page.waitForSelector('.recharts-wrapper');
    
    // Check that charts are interactive
    const charts = page.locator('.recharts-wrapper');
    await expect(charts).toHaveCount(2);
    
    // Test hover interactions on charts
    const firstChart = charts.first();
    await firstChart.hover();
    
    // Check that chart tooltips or legends are present
    const chartElements = page.locator('.recharts-tooltip-wrapper, .recharts-legend-wrapper');
    if (await chartElements.count() > 0) {
      await expect(chartElements.first()).toBeVisible();
    }
  });

  test('should maintain visual consistency across browsers', async ({ page }) => {
    // Wait for content to load
    await page.waitForSelector('.reports-page');
    
    // Check that all major sections are visible
    const sections = [
      '.reports-page',
      '.summary-section',
      '.charts-section',
      '.tables-section'
    ];
    
    for (const sectionSelector of sections) {
      const section = page.locator(sectionSelector);
      if (await section.count() > 0) {
        await expect(section.first()).toBeVisible();
      }
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
    const loadingText = page.locator('text=Loading...');
    
    // If loading text is present, wait for it to disappear
    if (await loadingText.isVisible()) {
      await expect(loadingText).not.toBeVisible({ timeout: 10000 });
    }
    
    // Verify reports data is loaded
    await page.waitForSelector('.summary-card, .recharts-wrapper', { timeout: 10000 });
    
    // Check that summary cards have data
    const summaryValues = page.locator('.summary-value');
    await expect(summaryValues).toHaveCount(4);
    
    // Verify that at least one summary value is loaded
    const firstValue = summaryValues.first();
    const valueText = await firstValue.textContent();
    expect(valueText.trim().length).toBeGreaterThan(0);
  });

  test('should display financial calculations correctly across browsers', async ({ page }) => {
    // Wait for summary cards to load
    await page.waitForSelector('.summary-card');
    
    // Check that profit calculation is correct (Revenue - Expenses)
    const revenueCard = page.locator('.summary-card').filter({ hasText: 'Revenue' });
    const expensesCard = page.locator('.summary-card').filter({ hasText: 'Expenses' });
    const profitCard = page.locator('.summary-card').filter({ hasText: 'Profit' });
    
    if (await revenueCard.count() > 0 && await expensesCard.count() > 0 && await profitCard.count() > 0) {
      const revenueValue = await revenueCard.locator('.summary-value').textContent();
      const expensesValue = await expensesCard.locator('.summary-value').textContent();
      const profitValue = await profitCard.locator('.summary-value').textContent();
      
      // Parse values (remove $ and commas)
      const revenue = parseFloat(revenueValue.replace(/[$,]/g, ''));
      const expenses = parseFloat(expensesValue.replace(/[$,]/g, ''));
      const profit = parseFloat(profitValue.replace(/[$,]/g, ''));
      
      // Profit should equal revenue minus expenses (within rounding error)
      expect(Math.abs(profit - (revenue - expenses))).toBeLessThan(0.01);
    }
  });
});
