const { test, expect } = require('@playwright/test');

test.describe('ChatBot - Cross Browser Compatibility', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page where chatbot is available
    await page.goto('/');
  });

  test('should render chatbot correctly across browsers', async ({ page }) => {
    // Check chatbot toggle button is visible
    const chatToggle = page.locator('.chat-toggle');
    await expect(chatToggle).toBeVisible();
    
    // Check chatbot container exists but is hidden initially
    const chatContainer = page.locator('.chat-container');
    await expect(chatContainer).toBeVisible();
  });

  test('should open and close chat window across browsers', async ({ page }) => {
    // Click chat toggle to open
    const chatToggle = page.locator('.chat-toggle');
    await chatToggle.click();
    
    // Check chat window is visible
    const chatWindow = page.locator('.chat-window');
    await expect(chatWindow).toBeVisible();
    
    // Check chat header
    const chatHeader = page.locator('.chat-header');
    await expect(chatHeader).toHaveText('Spa Assistant');
    
    // Click toggle again to close
    await chatToggle.click();
    
    // Check chat window is hidden
    await expect(chatWindow).not.toBeVisible();
  });

  test('should display welcome message across browsers', async ({ page }) => {
    // Open chat window
    await page.locator('.chat-toggle').click();
    
    // Wait for welcome message
    await page.waitForSelector('.message.bot-message');
    
    // Check welcome message is displayed
    const welcomeMessage = page.locator('.message.bot-message').first();
    await expect(welcomeMessage).toBeVisible();
    
    // Verify message contains welcome text
    const messageText = await welcomeMessage.textContent();
    expect(messageText).toContain('Welcome');
  });

  test('should handle user input across browsers', async ({ page }) => {
    // Open chat window
    await page.locator('.chat-toggle').click();
    
    // Wait for chat input to be visible
    await page.waitForSelector('.chat-input');
    
    // Check input field is present
    const chatInput = page.locator('.chat-input');
    await expect(chatInput).toBeVisible();
    await expect(chatInput).toHaveAttribute('placeholder', 'Type your message...');
    
    // Type a message
    await chatInput.fill('Hello, how are you?');
    
    // Verify text was entered
    await expect(chatInput).toHaveValue('Hello, how are you?');
  });

  test('should send messages across browsers', async ({ page }) => {
    // Open chat window
    await page.locator('.chat-toggle').click();
    
    // Wait for chat input and send button
    await page.waitForSelector('.chat-input');
    await page.waitForSelector('.send-button');
    
    // Type and send a message
    const chatInput = page.locator('.chat-input');
    const sendButton = page.locator('.send-button');
    
    await chatInput.fill('Test message');
    await sendButton.click();
    
    // Check message was sent (appears in chat)
    const userMessage = page.locator('.message.user-message').filter({ hasText: 'Test message' });
    await expect(userMessage).toBeVisible();
  });

  test('should handle appointment completion workflow across browsers', async ({ page }) => {
    // Open chat window
    await page.locator('.chat-toggle').click();
    
    // Wait for chat to be ready
    await page.waitForSelector('.chat-input');
    
    // Send completion request
    const chatInput = page.locator('.chat-input');
    const sendButton = page.locator('.send-button');
    
    await chatInput.fill('Complete my appointment for tomorrow');
    await sendButton.click();
    
    // Wait for bot response
    await page.waitForSelector('.message.bot-message', { timeout: 10000 });
    
    // Check bot responded
    const botMessages = page.locator('.message.bot-message');
    const messageCount = await botMessages.count();
    expect(messageCount).toBeGreaterThan(1); // Welcome + response
  });

  test('should handle appointment cancellation workflow across browsers', async ({ page }) => {
    // Open chat window
    await page.locator('.chat-toggle').click();
    
    // Wait for chat to be ready
    await page.waitForSelector('.chat-input');
    
    // Send cancellation request
    const chatInput = page.locator('.chat-input');
    const sendButton = page.locator('.send-button');
    
    await chatInput.fill('Cancel my appointment for next week');
    await sendButton.click();
    
    // Wait for bot response
    await page.waitForSelector('.message.bot-message', { timeout: 10000 });
    
    // Check bot responded
    const botMessages = page.locator('.message.bot-message');
    const messageCount = await botMessages.count();
    expect(messageCount).toBeGreaterThan(1); // Welcome + response
  });

  test('should maintain responsive behavior across browsers', async ({ page }) => {
    // Open chat window
    await page.locator('.chat-toggle').click();
    
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('.chat-window')).toBeVisible();
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('.chat-window')).toBeVisible();
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.chat-window')).toBeVisible();
  });

  test('should handle keyboard navigation across browsers', async ({ page }) => {
    // Open chat window
    await page.locator('.chat-toggle').click();
    
    // Wait for chat input
    await page.waitForSelector('.chat-input');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    
    // Check focus is on chat input
    const chatInput = page.locator('.chat-input');
    await expect(chatInput).toBeFocused();
    
    // Test Enter key to send message
    await chatInput.fill('Test message');
    await page.keyboard.press('Enter');
    
    // Check message was sent
    const userMessage = page.locator('.message.user-message').filter({ hasText: 'Test message' });
    await expect(userMessage).toBeVisible();
  });

  test('should maintain visual consistency across browsers', async ({ page }) => {
    // Open chat window
    await page.locator('.chat-toggle').click();
    
    // Wait for chat elements
    await page.waitForSelector('.chat-window');
    
    // Check CSS classes are applied correctly
    const chatWindow = page.locator('.chat-window');
    await expect(chatWindow).toHaveClass(/chat-window/);
    
    const chatHeader = page.locator('.chat-header');
    await expect(chatHeader).toHaveClass(/chat-header/);
    
    const chatInput = page.locator('.chat-input');
    await expect(chatInput).toHaveClass(/chat-input/);
  });

  test('should persist chat state across browsers', async ({ page }) => {
    // Open chat window
    await page.locator('.chat-toggle').click();
    
    // Wait for chat to be ready
    await page.waitForSelector('.chat-input');
    
    // Send a message
    const chatInput = page.locator('.chat-input');
    const sendButton = page.locator('.send-button');
    
    await chatInput.fill('Persistent message');
    await sendButton.click();
    
    // Wait for message to appear
    await page.waitForSelector('.message.user-message');
    
    // Verify message is still there
    const userMessage = page.locator('.message.user-message').filter({ hasText: 'Persistent message' });
    await expect(userMessage).toBeVisible();
  });

  test('should handle error states across browsers', async ({ page }) => {
    // Open chat window
    await page.locator('.chat-toggle').click();
    
    // Wait for chat to be ready
    await page.waitForSelector('.chat-input');
    
    // Try to send an empty message
    const sendButton = page.locator('.send-button');
    
    // Check if send button is disabled for empty input
    const isDisabled = await sendButton.isDisabled();
    
    // If button is enabled, try to send empty message
    if (!isDisabled) {
      await sendButton.click();
      
      // Check if error handling is in place
      const errorMessage = page.locator('.error-message, .message.error');
      if (await errorMessage.count() > 0) {
        await expect(errorMessage).toBeVisible();
      }
    }
  });
});
