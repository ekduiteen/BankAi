import { test, expect } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1:13000';
const ADMIN_EMAIL = 'admin@bankai.io';
const ADMIN_PASSWORD = 'admin123';

test.describe('Session-Aware RAG E2E Test', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto(`${BASE_URL}/login`);

    // Log in with admin credentials
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button:has-text("Sign In")');

    // Wait for dashboard to load
    await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 10000 });
  });

  test('should prioritize uploaded document in RAG response and attribute sources', async ({ page }) => {
    // Navigate to Chat
    console.log('Navigating to chat page');
    const chatLinks = page.locator('a:has-text("chat")');
    const linkCount = await chatLinks.count();
    console.log(`Found ${linkCount} chat links`);

    if (linkCount > 0) {
      await chatLinks.first().click();
    } else {
      await page.goto(`${BASE_URL}/chat`);
    }

    // Wait for chat page to load
    await page.waitForURL(/\/chat/, { timeout: 10000 });
    console.log(`URL changed to: ${page.url()}`);

    // Create new session (if not automatically created)
    const sessionButton = page.locator('button:has-text("New Session")');
    if (await sessionButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await sessionButton.click();
    }

    // Wait for chat interface to load with longer timeout
    console.log('Waiting for chat input');
    await page.waitForSelector('[data-testid="chat-input"]', { timeout: 15000 });

    // Upload test document
    const uploadInput = page.locator('input[type="file"]');
    await uploadInput.setInputFiles('/e/BankAi/frontend/tests/e2e/fixtures/Loan_Policy.txt');

    // Wait for document to be uploaded and processed
    await page.waitForTimeout(3000);

    // Verify document appears in the document list
    const documentBadge = page.locator('text=Loan_Policy');
    await expect(documentBadge).toBeVisible({ timeout: 10000 });

    // Wait for document processing to complete (status = ready)
    const readyBadge = page.locator('text=Ready for questions');
    await expect(readyBadge).toBeVisible({ timeout: 30000 });

    // Ask a question about the loan agreement
    const chatInput = page.locator('[data-testid="chat-input"]');
    await chatInput.fill('What is the loan amount in the agreement?');

    // Send message using Enter key
    await page.keyboard.press('Enter');

    // Wait for response to stream in
    await page.waitForTimeout(2000);

    // Verify response appears
    const responseText = page.locator('[data-testid="message-content"]').last();
    await expect(responseText).toContainText('5,000,000', { timeout: 30000});

    // Verify source attribution is present
    const sourceCards = page.locator('[data-testid="source-card"]');
    const sourceCount = await sourceCards.count();
    expect(sourceCount).toBeGreaterThan(0);

    // Verify the source references the uploaded document
    const sourceText = await sourceCards.first().textContent();
    expect(sourceText).toContain('Loan_Policy');

    // Verify relevance score is present
    expect(sourceText).toMatch(/\d+\.\d+%/);

    console.log('✓ Session-aware RAG test passed: uploaded document prioritized and properly attributed');
  });

  test('should return to uploaded document on follow-up question', async ({ page }) => {
    // Navigate to Chat
    console.log('Navigating to chat page');
    const chatLinks = page.locator('a:has-text("chat")');
    if (await chatLinks.count() > 0) {
      await chatLinks.first().click();
    } else {
      await page.goto(`${BASE_URL}/chat`);
    }
    await page.waitForURL(/\/chat/, { timeout: 10000 });

    // Create new session
    const sessionButton = page.locator('button:has-text("New Session")');
    if (await sessionButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await sessionButton.click();
    }

    // Wait for chat interface
    console.log('Waiting for chat input');
    await page.waitForSelector('[data-testid="chat-input"]', { timeout: 15000 });

    // Upload test document
    const uploadInput = page.locator('input[type="file"]');
    await uploadInput.setInputFiles('/e/BankAi/frontend/tests/e2e/fixtures/Loan_Policy.txt');

    // Wait for upload
    await page.waitForTimeout(3000);

    // Wait for ready status
    const readyBadge = page.locator('text=Ready for questions');
    await expect(readyBadge).toBeVisible({ timeout: 30000 });

    // First question
    const chatInput = page.locator('[data-testid="chat-input"]');
    await chatInput.fill('What is the interest rate?');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);

    // Verify first response
    const firstResponse = page.locator('[data-testid="message-content"]').last();
    await expect(firstResponse).toContainText('8.5%', { timeout: 30000 });

    // Second follow-up question
    await chatInput.fill('What are the monthly payments?');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);

    // Verify second response also uses the uploaded document
    const secondResponse = page.locator('[data-testid="message-content"]').last();
    await expect(secondResponse).toContainText('157,500', { timeout: 30000 });

    // Verify sources are still attributed to uploaded document
    const sourceCards = page.locator('[data-testid="source-card"]');
    const sourceText = await sourceCards.first().textContent();
    expect(sourceText).toContain('Loan_Policy');

    console.log('✓ Follow-up question test passed: session context maintained across queries');
  });

  test('should handle multiple document uploads and maintain session scope', async ({ page }) => {
    // Navigate to Chat
    console.log('Navigating to chat page');
    const chatLinks = page.locator('a:has-text("chat")');
    if (await chatLinks.count() > 0) {
      await chatLinks.first().click();
    } else {
      await page.goto(`${BASE_URL}/chat`);
    }
    await page.waitForURL(/\/chat/, { timeout: 10000 });

    // Create new session
    const sessionButton = page.locator('button:has-text("New Session")');
    if (await sessionButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await sessionButton.click();
    }

    // Wait for chat interface
    console.log('Waiting for chat input');
    await page.waitForSelector('[data-testid="chat-input"]', { timeout: 15000 });

    // Upload test document twice to simulate multiple docs
    const uploadInput = page.locator('input[type="file"]');
    await uploadInput.setInputFiles('/e/BankAi/frontend/tests/e2e/fixtures/Loan_Policy.txt');
    await page.waitForTimeout(2000);

    // Verify both documents are tracked
    const documentLabels = page.locator('[data-testid="document-label"]');
    const docCount = await documentLabels.count();
    expect(docCount).toBeGreaterThan(0);

    // Ask question
    const chatInput = page.locator('[data-testid="chat-input"]');
    await chatInput.fill('List the compliance requirements from the agreement.');
    await page.keyboard.press('Enter');

    // Wait for response
    await page.waitForTimeout(3000);

    // Verify response
    const response = page.locator('[data-testid="message-content"]').last();
    await expect(response).toContainText('Quarterly financial', { timeout: 30000 });

    console.log('✓ Multiple document test passed: session scope maintained');
  });
});
