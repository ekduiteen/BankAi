import { test } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1:13000';
const ADMIN_EMAIL = 'admin@bankai.io';
const ADMIN_PASSWORD = 'admin123';

test('diagnostic: check page structure', async ({ page }) => {
  // Enable verbose logging
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('error', err => console.log('PAGE ERROR:', err));

  // Navigate to login
  console.log('Going to login page');
  await page.goto(`${BASE_URL}/login`);

  // Log in
  console.log('Logging in');
  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASSWORD);
  await page.click('button:has-text("Sign In")');

  // Wait for dashboard
  await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 15000 });
  console.log('Logged in, at dashboard');

  // Navigate to chat
  console.log('Navigating to /chat');
  await page.goto(`${BASE_URL}/chat`);

  // Wait a moment for page to render
  await page.waitForTimeout(3000);

  // Check what's on the page
  const body = await page.locator('body').innerHTML();
  console.log('Body HTML length:', body.length);

  // Check for specific elements
  const textareas = await page.locator('textarea').count();
  console.log(`Found ${textareas} textareas`);

  const inputs = await page.locator('input[type="file"]').count();
  console.log(`Found ${inputs} file inputs`);

  const chatInputs = await page.locator('[data-testid="chat-input"]').count();
  console.log(`Found ${chatInputs} chat-input elements`);

  // Take a screenshot
  await page.screenshot({ path: '/e/BankAi/frontend/tests/e2e/chat-page.png' });

  // Get page title
  console.log('Page title:', await page.title());
  console.log('Page URL:', page.url());

  // List all h1, h2 elements
  const headings = await page.locator('h1, h2').allTextContents();
  console.log('Headings:', headings);

  // List all buttons
  const buttons = await page.locator('button').allTextContents();
  console.log('First 10 buttons:', buttons.slice(0, 10));
});
