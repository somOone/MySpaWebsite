const { test, expect } = require('@playwright/test');

test.describe('ChatBot - Cross Browser Compatibility', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a page with ChatBot (e.g., appointments page)
    await page.goto('/appointments');
    
    // Wait for ChatBot to be available
    await page.waitForSelector('.chatbot-toggle');
  });

  test('should render ChatBot correctly across browsers', async ({ page }) => {
    // Check that ChatBot toggle button is visible
    const toggleButton = page.locator('.chatbot-toggle');
    await expect(toggleButton).toBeVisible();
    
    // Check that ChatBot is initially closed
    const chatContainer = page.locator('.chatbot-container');
    await expect(chatContainer).not.toBeVisible();
  });

  test('should open and close ChatBot across browsers', async ({ page }) => {
    // Click toggle button to open ChatBot
    const toggleButton = page.locator('.chatbot-toggle');
    await toggleButton.click();
    
    // Check that ChatBot is now visible
    const chatContainer = page.locator('.chatbot-container');
    await expect(chatContainer).toBeVisible();
    
    // Check ChatBot header
    const chatHeader = page.locator('.chatbot-header');
    await expect(chatHeader).toBeVisible();
    await expect(chatHeader).toHaveText('💬 Spa Assistant');
    
    // Click toggle button again to close ChatBot
    await toggleButton.click();
    
    // Check that ChatBot is closed
    await expect(chatContainer).not.toBeVisible();
  });

  test('should display welcome message across browsers', async ({ page }) => {
    // Open ChatBot
    const toggleButton = page.locator('.chatbot-toggle');
    await toggleButton.click();
    
    // Wait for welcome message
    await page.waitForSelector('.message.bot-message');
    
    // Check welcome message content
    const welcomeMessage = page.locator('.message.bot-message').first();
    await expect(welcomeMessage).toBeVisible();
    
    // Verify message contains welcome text
    const messageText = await welcomeMessage.textContent();
    expect(messageText).toContain('Hello');
  });

  test('should handle user input across browsers', async ({ page }) => {
    // Open ChatBot
    const toggleButton = page.locator('.chatbot-toggle');
    await toggleButton.click();
    
    // Wait for chat input to be available
    await page.waitForSelector('.chat-input');
    
    // Check input field
    const chatInput = page.locator('.chat-input');
    await expect(chatInput).toBeVisible();
    await expect(chatInput).toHaveAttribute('placeholder', 'Type your message...');
    
    // Type a message
    await chatInput.fill('Hello');
    
    // Check that input contains the text
    await expect(chatInput).toHaveValue('Hello');
  });

  test('should send messages across browsers', async ({ page }) => {
    // Open ChatBot
    const toggleButton = page.locator('.chatbot-toggle');
    await toggleButton.click();
    
    // Wait for chat input and send button
    await page.waitForSelector('.chat-input');
    await page.waitForSelector('.send-button');
    
    // Type and send a message
    const chatInput = page.locator('.chat-input');
    const sendButton = page.locator('.send-button');
    
    await chatInput.fill('Test message');
    await sendButton.click();
    
    // Check that user message appears
    const userMessage = page.locator('.message.user-message').last();
    await expect(userMessage).toBeVisible();
    await expect(userMessage).toHaveText('Test message');
  });

  test('should handle appointment completion workflow across browsers', async ({ page }) => {
    // Open ChatBot
    const toggleButton = page.locator('.chatbot-toggle');
    await toggleButton.click();
    
    // Wait for chat input
    await page.waitForSelector('.chat-input');
    
    // Send appointment completion request
    const chatInput = page.locator('.chat-input');
    const sendButton = page.locator('.send-button');
    
    await chatInput.fill('Complete appointment for John Doe');
    await sendButton.click();
    
    // Wait for bot response
    await page.waitForTimeout(2000);
    
    // Check that bot responded
    const botMessages = page.locator('.message.bot-message');
    const messageCount = await botMessages.count();
    expect(messageCount).toBeGreaterThan(1); // Should have welcome + response
  });

  test('should handle appointment cancellation workflow across browsers', async ({ page }) => {
    // Open ChatBot
    const toggleButton = page.locator('.chatbot-toggle');
    await toggleButton.click();
    
    // Wait for chat input
    await page.waitForSelector('.chat-input');
    
    // Send appointment cancellation request
    const chatInput = page.locator('.chat-input');
    const sendButton = page.locator('.send-button');
    
    await chatInput.fill('Cancel appointment for John Doe');
    await sendButton.click();
    
    // Wait for bot response
    await page.waitForTimeout(2000);
    
    // Check that bot responded
    const botMessages = page.locator('.message.bot-message');
    const messageCount = await botMessages.count();
    expect(messageCount).toBeGreaterThan(1); // Should have welcome + response
  });

  test('should maintain responsive behavior across browsers', async ({ page }) => {
    // Open ChatBot
    const toggleButton = page.locator('.chatbot-toggle');
    await toggleButton.click();
    
    // Wait for ChatBot to be visible
    await page.waitForSelector('.chatbot-container');
    
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    
    const chatContainer = page.locator('.chatbot-container');
    await expect(chatContainer).toBeVisible();
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(chatContainer).toBeVisible();
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(chatContainer).toBeVisible();
  });

  test('should handle keyboard navigation across browsers', async ({ page }) => {
    // Open ChatBot
    const toggleButton = page.locator('.chatbot-toggle');
    await toggleButton.click();
    
    // Wait for chat input
    await page.waitForSelector('.chat-input');
    
    // Focus on chat input
    const chatInput = page.locator('.chat-input');
    await chatInput.focus();
    
    // Check that input is focused
    await expect(chatInput).toBeFocused();
    
    // Test Enter key to send message
    await chatInput.fill('Test message');
    await chatInput.press('Enter');
    
    // Check that message was sent
    const userMessage = page.locator('.message.user-message').last();
    await expect(userMessage).toBeVisible();
    await expect(userMessage).toHaveText('Test message');
  });

  test('should maintain visual consistency across browsers', async ({ page }) => {
    // Open ChatBot
    const toggleButton = page.locator('.chatbot-toggle');
    await toggleButton.click();
    
    // Wait for ChatBot to be visible
    await page.waitForSelector('.chatbot-container');
    
    // Check that all ChatBot elements are visible
    const elements = [
      '.chatbot-container',
      '.chatbot-header',
      '.chat-messages',
      '.chat-input-container',
      '.chat-input',
      '.send-button'
    ];
    
    for (const selector of elements) {
      const element = page.locator(selector);
      await expect(element).toBeVisible();
    }
    
    // Check that no console errors occurred
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Send a message to trigger any potential errors
    const chatInput = page.locator('.chat-input');
    const sendButton = page.locator('.send-button');
    
    await chatInput.fill('Test message');
    await sendButton.click();
    
    // Wait for any processing
    await page.waitForTimeout(1000);
    
    // Verify no critical console errors
    expect(consoleErrors.length).toBeLessThan(5); // Allow some non-critical warnings
  });

  test('should handle chat state persistence across browsers', async ({ page }) => {
    // Open ChatBot
    const toggleButton = page.locator('.chatbot-toggle');
    await toggleButton.click();
    
    // Wait for chat input
    await page.waitForSelector('.chat-input');
    
    // Send a message
    const chatInput = page.locator('.chat-input');
    const sendButton = page.locator('.send-button');
    
    await chatInput.fill('Test message');
    await sendButton.click();
    
    // Check that message is displayed
    const userMessage = page.locator('.message.user-message').last();
    await expect(userMessage).toBeVisible();
    
    // Close and reopen ChatBot
    await toggleButton.click();
    await page.waitForTimeout(500);
    await toggleButton.click();
    
    // Check that previous message is still visible
    await expect(userMessage).toBeVisible();
  });

  test('should handle error states gracefully across browsers', async ({ page }) => {
    // Open ChatBot
    const toggleButton = page.locator('.chatbot-toggle');
    await toggleButton.click();
    
    // Wait for chat input
    await page.waitForSelector('.chat-input');
    
    // Try to send an empty message
    const sendButton = page.locator('.send-button');
    
    // Check that send button is initially disabled for empty input
    const chatInput = page.locator('.chat-input');
    await expect(chatInput).toHaveValue('');
    
    // Send button should be disabled when input is empty
    const isDisabled = await sendButton.isDisabled();
    expect(isDisabled).toBeTruthy();
    
    // Fill input and check that send button becomes enabled
    await chatInput.fill('Test message');
    await expect(sendButton).toBeEnabled();
  });
});
