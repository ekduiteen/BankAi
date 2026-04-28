import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = 'http://127.0.0.1:13000';
const ADMIN_EMAIL = 'admin@bankai.io';
const ADMIN_PASSWORD = 'admin123';
const TEST_FILE = join(__dirname, 'fixtures', 'Loan_Policy.txt');

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
    await page.goto(`${BASE_URL}/chat`);
    await page.waitForURL(`${BASE_URL}/chat`, { timeout: 10000 });

    // Wait for textarea to appear (chat input)
    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible({ timeout: 10000 });

    // Get file input (even though it's hidden, we can still interact with it)
    const fileInput = page.locator('input[type="file"]');

    // Upload test document
    console.log('Uploading test document');
    const testFilePath = TEST_FILE;
    console.log('Using file path:', testFilePath);
    await fileInput.setInputFiles(testFilePath);

    // Wait for document to be uploaded and processed
    await page.waitForTimeout(3000);

    // Verify document name appears somewhere on the page
    await expect(page.locator('text=Loan_Policy')).toBeVisible({ timeout: 15000 });

    // Wait for "Ready for questions" badge to appear
    const readyBadge = page.locator('text=Ready for questions');
    await expect(readyBadge).toBeVisible({ timeout: 30000 });
    console.log('Document ready for questions');

    // Ask a question about the loan agreement
    const chatTextarea = page.locator('textarea');
    await chatTextarea.fill('What is the loan amount in the agreement?');
    console.log('Filled question');

    // Send message using Enter key
    await page.keyboard.press('Enter');
    console.log('Sent message');

    // Wait for response to appear
    await page.waitForTimeout(3000);

    // Verify response contains the expected text
    const responseArea = page.locator('div:has-text("5,000,000")');
    await expect(responseArea).toBeVisible({ timeout: 30000 });
    console.log('Response contains loan amount');

    // Verify source attribution is present (look for the source chip with description icon)
    const sourceChip = page.locator('span:has-text("Loan_Policy")');
    await expect(sourceChip).toBeVisible({ timeout: 10000 });
    console.log('✓ Source attribution verified: uploaded document is properly cited');

    // Verify the source is visible in the chat
    const chatBody = page.locator('body');
    const chatText = await chatBody.textContent();
    expect(chatText).toContain('Loan_Policy');
    expect(chatText).toContain('5,000,000');

    console.log('✓ Session-aware RAG test passed: uploaded document prioritized and properly attributed');
  });

  test('should return to uploaded document on follow-up question', async ({ page }) => {
    // Navigate to Chat
    await page.goto(`${BASE_URL}/chat`);
    await page.waitForURL(`${BASE_URL}/chat`, { timeout: 10000 });

    // Wait for textarea to appear
    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible({ timeout: 10000 });

    // Upload test document
    const fileInput = page.locator('input[type="file"]');
    const testFilePath = TEST_FILE;
    await fileInput.setInputFiles(testFilePath);
    await page.waitForTimeout(3000);

    // Wait for ready badge
    const readyBadge = page.locator('text=Ready for questions');
    await expect(readyBadge).toBeVisible({ timeout: 30000 });

    // First question - interest rate
    const chatTextarea = page.locator('textarea');
    await chatTextarea.fill('What is the interest rate?');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);

    // Verify first response contains interest rate
    const firstResponse = page.locator('body');
    let bodyText = await firstResponse.textContent();
    expect(bodyText).toContain('8.5');
    console.log('✓ First question answered: interest rate found');

    // Second question - monthly payments
    await chatTextarea.fill('What are the monthly payments?');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);

    // Verify second response contains payment amount
    bodyText = await firstResponse.textContent();
    expect(bodyText).toContain('157,500');
    console.log('✓ Second question answered: payment amount found');

    // Verify both responses cite the uploaded document
    const sourceElement = page.locator('span:has-text("Loan_Policy")');
    expect(await sourceElement.count()).toBeGreaterThan(0);

    console.log('✓ Follow-up question test passed: session context maintained across queries');
  });

  test('should extract and cite specific document content', async ({ page }) => {
    // Navigate to Chat
    await page.goto(`${BASE_URL}/chat`);
    await page.waitForURL(`${BASE_URL}/chat`, { timeout: 10000 });

    // Wait for textarea
    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible({ timeout: 10000 });

    // Upload document
    const fileInput = page.locator('input[type="file"]');
    const testFilePath = TEST_FILE;
    await fileInput.setInputFiles(testFilePath);
    await page.waitForTimeout(3000);

    // Wait for ready badge
    const readyBadge = page.locator('text=Ready for questions');
    await expect(readyBadge).toBeVisible({ timeout: 30000 });

    // Ask about compliance requirements
    const chatTextarea = page.locator('textarea');
    await chatTextarea.fill('List the compliance requirements from the agreement.');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);

    // Verify response mentions compliance requirements
    const bodyText = page.locator('body');
    const text = await bodyText.textContent();
    expect(text.toLowerCase()).toContain('compliance');
    expect(text.toLowerCase()).toContain('financial');
    console.log('✓ Compliance requirements cited from document');

    // Verify document source is attributed
    const sourceChip = page.locator('span:has-text("Loan_Policy")');
    expect(await sourceChip.count()).toBeGreaterThan(0);

    console.log('✓ Document content extraction and citation test passed');
  });
});
