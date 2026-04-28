# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: session-rag-working.spec.js >> Session-Aware RAG E2E Test >> should prioritize uploaded document in RAG response and attribute sources
- Location: tests\e2e\session-rag-working.spec.js:27:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Loan_Policy')
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for locator('text=Loan_Policy')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - complementary [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e7]: account_balance
      - generic [ref=e8]:
        - heading "BankAi" [level=2] [ref=e9]
        - paragraph [ref=e10]: Enterprise AI
    - button "upload_file Upload Document" [ref=e11] [cursor=pointer]:
      - generic [ref=e12]: upload_file
      - text: Upload Document
    - navigation [ref=e13]:
      - link "add_comment New Chat" [ref=e14] [cursor=pointer]:
        - /url: /chat
        - generic [ref=e15]: add_comment
        - text: New Chat
      - link "history Session History" [ref=e16] [cursor=pointer]:
        - /url: /sessions
        - generic [ref=e17]: history
        - text: Session History
      - link "folder_managed Document Library" [ref=e18] [cursor=pointer]:
        - /url: /documents
        - generic [ref=e19]: folder_managed
        - text: Document Library
      - link "analytics Analytics" [ref=e20] [cursor=pointer]:
        - /url: /analytics
        - generic [ref=e21]: analytics
        - text: Analytics
    - generic [ref=e22]:
      - link "verified_user Security Status" [ref=e23] [cursor=pointer]:
        - /url: /admin/security
        - generic [ref=e24]: verified_user
        - text: Security Status
      - link "help_outline Help Center" [ref=e25] [cursor=pointer]:
        - /url: /help
        - generic [ref=e26]: help_outline
        - text: Help Center
  - generic [ref=e27]:
    - banner [ref=e28]:
      - generic [ref=e29]:
        - generic [ref=e30]: Vault AI
        - navigation [ref=e31]:
          - link "Analysis" [ref=e32] [cursor=pointer]:
            - /url: /chat
          - link "Audit Log" [ref=e33] [cursor=pointer]:
            - /url: /audit-logs
          - link "Compliance" [ref=e34] [cursor=pointer]:
            - /url: /compliance
      - generic [ref=e35]:
        - generic [ref=e36]:
          - button "EN" [ref=e37] [cursor=pointer]
          - button "ने" [ref=e38] [cursor=pointer]
        - generic [ref=e39]:
          - button "enhanced_encryption" [ref=e40] [cursor=pointer]:
            - generic [ref=e41]: enhanced_encryption
          - button "notifications" [ref=e42] [cursor=pointer]:
            - generic [ref=e43]: notifications
          - link "settings" [ref=e44] [cursor=pointer]:
            - /url: /settings
            - generic [ref=e45]: settings
          - button "SA" [ref=e47] [cursor=pointer]
    - main [ref=e48]:
      - generic [ref=e50]:
        - generic [ref=e51]:
          - generic [ref=e52]:
            - generic [ref=e54]: bolt
            - generic [ref=e55]: hello
          - generic [ref=e56]:
            - button "add_comment New Chat" [ref=e57] [cursor=pointer]:
              - generic [ref=e58]: add_comment
              - text: New Chat
            - button "history" [ref=e59] [cursor=pointer]:
              - generic [ref=e60]: history
        - generic [ref=e62]:
          - generic [ref=e65]:
            - paragraph [ref=e66]: hello
            - button "edit Edit" [ref=e68] [cursor=pointer]:
              - generic [ref=e69]: edit
              - text: Edit
            - generic [ref=e70]: 10:26 AM · EN
          - generic [ref=e71]:
            - generic [ref=e73]: bolt
            - generic [ref=e75]:
              - generic [ref=e77]: Namaste. How may I assist you today?
              - generic [ref=e78]:
                - button "content_copy Copy" [ref=e79] [cursor=pointer]:
                  - generic [ref=e80]: content_copy
                  - text: Copy
                - button "refresh Regenerate" [ref=e81] [cursor=pointer]:
                  - generic [ref=e82]: refresh
                  - text: Regenerate
          - generic [ref=e85]:
            - paragraph [ref=e86]: What services do you offer?
            - button "edit Edit" [ref=e88] [cursor=pointer]:
              - generic [ref=e89]: edit
              - text: Edit
            - generic [ref=e90]: 10:26 AM · EN
          - generic [ref=e91]:
            - generic [ref=e93]: bolt
            - generic [ref=e95]:
              - generic [ref=e96]:
                - generic [ref=e97]: Namaste. As your intelligent banking assistant, I offer a comprehensive suite of financial services designed to meet your needs.
                - generic [ref=e99]: "Our services cover personal finance, business banking, and investment management. Here is an overview of what we offer:"
                - generic [ref=e101]:
                  - generic [ref=e102]: •
                  - strong [ref=e104]: "Account Management:"
                - generic [ref=e105]:
                  - generic [ref=e106]: •
                  - generic [ref=e107]: Checking Accounts (Daily transactions)
                - generic [ref=e108]:
                  - generic [ref=e109]: •
                  - generic [ref=e110]: Savings Accounts (Building wealth and security)
                - generic [ref=e111]:
                  - generic [ref=e112]: •
                  - generic [ref=e113]: Certificates of Deposit (Fixed, interest-bearing funds)
                - generic [ref=e114]:
                  - generic [ref=e115]: •
                  - strong [ref=e117]: "Payments and Transfers:"
                - generic [ref=e118]:
                  - generic [ref=e119]: •
                  - generic [ref=e120]: Online Bill Payments
                - generic [ref=e121]:
                  - generic [ref=e122]: •
                  - generic [ref=e123]: Wire Transfers (Domestic and International)
                - generic [ref=e124]:
                  - generic [ref=e125]: •
                  - generic [ref=e126]: Debit and Credit Card Services
                - generic [ref=e127]:
                  - generic [ref=e128]: •
                  - strong [ref=e130]: "Lending Solutions:"
                - generic [ref=e131]:
                  - generic [ref=e132]: •
                  - generic [ref=e133]: Personal Loans
                - generic [ref=e134]:
                  - generic [ref=e135]: •
                  - generic [ref=e136]: Mortgages (Home financing)
                - generic [ref=e137]:
                  - generic [ref=e138]: •
                  - generic [ref=e139]: Business Lines of Credit
                - generic [ref=e140]:
                  - generic [ref=e141]: •
                  - strong [ref=e143]: "Digital Banking:"
                - generic [ref=e144]:
                  - generic [ref=e145]: •
                  - generic [ref=e146]: Secure Mobile Banking (24/7 access)
                - generic [ref=e147]:
                  - generic [ref=e148]: •
                  - generic [ref=e149]: Online Banking Portal
                - generic [ref=e150]:
                  - generic [ref=e151]: •
                  - generic [ref=e152]: Automated Alerts and Notifications
                - generic [ref=e154]: To help me provide you with the most accurate information, could you please specify what type of service you are interested in (e.g., personal loans, investment advice, or checking accounts)?
              - generic [ref=e155]:
                - button "content_copy Copy" [ref=e156] [cursor=pointer]:
                  - generic [ref=e157]: content_copy
                  - text: Copy
                - button "refresh Regenerate" [ref=e158] [cursor=pointer]:
                  - generic [ref=e159]: refresh
                  - text: Regenerate
          - generic [ref=e162]:
            - paragraph [ref=e163]: What are the current interest rates for savings accounts or mortgages?
            - button "edit Edit" [ref=e165] [cursor=pointer]:
              - generic [ref=e166]: edit
              - text: Edit
            - generic [ref=e167]: 10:26 AM · EN
          - generic [ref=e168]:
            - generic [ref=e170]: bolt
            - generic [ref=e171]:
              - generic [ref=e172]:
                - generic [ref=e173]:
                  - generic [ref=e174]: Namaste.
                  - generic [ref=e176]: Due to the highly volatile nature of financial markets, specific interest rates change frequently based on prevailing economic conditions, your credit profile, and the exact terms of the product. I cannot provide you with binding, real-time rates through this chat.
                  - generic [ref=e178]: "However, I can guide you on the current rate structures and what factors influence them:"
                  - heading "💰 Savings Account Rates (APY)" [level=3] [ref=e180]
                  - generic [ref=e182]: "Savings account rates depend on several factors, including the specific account type and the minimum balance requirements. Generally, rates are determined by:"
                  - generic [ref=e184]:
                    - generic [ref=e185]: •
                    - generic [ref=e186]:
                      - strong [ref=e187]: "Account Type:"
                      - text: (e.g., High-Yield vs. Standard Savings).
                  - generic [ref=e188]:
                    - generic [ref=e189]: •
                    - generic [ref=e190]:
                      - strong [ref=e191]: "Balance Tier:"
                      - text: (Some accounts offer higher APY for larger balances).
                  - generic [ref=e192]:
                    - generic [ref=e193]: •
                    - generic [ref=e194]:
                      - strong [ref=e195]: "Market Benchmarks:"
                      - text: (Fed funds rates).
                  - generic [ref=e197]: To get the most accurate current Annual Percentage Yield (APY), I recommend checking the rate section on our official website or speaking with a representative, as these rates can change daily.
                  - heading "🏠 Mortgage Rates" [level=3] [ref=e199]
                  - generic [ref=e201]: "Mortgage rates are highly personalized and are calculated based on a detailed review of your financial standing. Key factors influencing your rate include:"
                  - generic [ref=e203]:
                    - generic [ref=e204]: "1."
                    - generic [ref=e205]:
                      - strong [ref=e206]: "Loan-to-Value (LTV) Ratio:"
                      - text: (The percentage of the home’s value being financed).
                  - generic [ref=e207]:
                    - generic [ref=e208]: "2."
                    - generic [ref=e209]:
                      - strong [ref=e210]: "Loan Term:"
                      - text: (e.g., 15-year vs. 30-year fixed).
                  - generic [ref=e211]:
                    - generic [ref=e212]: "3."
                    - generic [ref=e213]:
                      - strong [ref=e214]: "Credit Score:"
                      - text: (A higher score generally results in a lower rate).
                  - generic [ref=e215]:
                    - generic [ref=e216]: "4."
                    - generic [ref=e217]:
                      - strong [ref=e218]: "Interest Rate Environment:"
                      - text: (Current market rates).
                  - strong [ref=e221]: "⭐ Next Steps to Obtain Specific Quotes:"
                  - generic [ref=e223]: "For the most precise and personalized rate quotes, I strongly recommend the following secure options:"
                  - generic [ref=e225]:
                    - generic [ref=e226]: "1."
                    - generic [ref=e227]:
                      - strong [ref=e228]: "Online Portal:"
                      - text: Log into your secure online banking portal where we often list current promotional rates.
                  - generic [ref=e229]:
                    - generic [ref=e230]: "2."
                    - generic [ref=e231]:
                      - strong [ref=e232]: "Dedicated Appointment:"
                      - text: Schedule a consultation with a mortgage specialist, who can run a pre-qualification analysis using your specific financial details.
                  - generic [ref=e234]: If you can provide general information (e.g., "I am looking for a 30-year mortgage" or "I am comparing savings accounts with minimum balances"), I can provide you with illustrative rate ranges and product comparisons.
                - generic [ref=e235]:
                  - button "content_copy Copy" [ref=e236] [cursor=pointer]:
                    - generic [ref=e237]: content_copy
                    - text: Copy
                  - button "refresh Regenerate" [ref=e238] [cursor=pointer]:
                    - generic [ref=e239]: refresh
                    - text: Regenerate
              - generic [ref=e240]:
                - button "What exactly is the Loan-to-Value (LTV) ratio, and how do I calculate mine?" [ref=e241] [cursor=pointer]
                - button "What credit score range generally qualifies for the lowest mortgage interest rate?" [ref=e242] [cursor=pointer]
                - button "If I want an illustration, what specific details should I provide about my savings accounts?" [ref=e243] [cursor=pointer]
        - generic [ref=e246]:
          - generic [ref=e247]:
            - button "attachment" [ref=e248] [cursor=pointer]:
              - generic [ref=e249]: attachment
            - textbox "Ask Vault AI about your documents in English or नेपाली..." [ref=e250]
            - button "send" [disabled] [ref=e252]:
              - generic [ref=e253]: send
          - paragraph [ref=e254]: Encrypted End-to-End · Private Cloud Environment
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import { fileURLToPath } from 'url';
  3   | import { dirname, join } from 'path';
  4   | 
  5   | const __filename = fileURLToPath(import.meta.url);
  6   | const __dirname = dirname(__filename);
  7   | 
  8   | const BASE_URL = 'http://127.0.0.1:13000';
  9   | const ADMIN_EMAIL = 'admin@bankai.io';
  10  | const ADMIN_PASSWORD = 'admin123';
  11  | const TEST_FILE = join(__dirname, 'fixtures', 'Loan_Policy.txt');
  12  | 
  13  | test.describe('Session-Aware RAG E2E Test', () => {
  14  |   test.beforeEach(async ({ page }) => {
  15  |     // Navigate to login page
  16  |     await page.goto(`${BASE_URL}/login`);
  17  | 
  18  |     // Log in with admin credentials
  19  |     await page.fill('input[type="email"]', ADMIN_EMAIL);
  20  |     await page.fill('input[type="password"]', ADMIN_PASSWORD);
  21  |     await page.click('button:has-text("Sign In")');
  22  | 
  23  |     // Wait for dashboard to load
  24  |     await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 10000 });
  25  |   });
  26  | 
  27  |   test('should prioritize uploaded document in RAG response and attribute sources', async ({ page }) => {
  28  |     // Navigate to Chat
  29  |     await page.goto(`${BASE_URL}/chat`);
  30  |     await page.waitForURL(`${BASE_URL}/chat`, { timeout: 10000 });
  31  | 
  32  |     // Wait for textarea to appear (chat input)
  33  |     const textarea = page.locator('textarea');
  34  |     await expect(textarea).toBeVisible({ timeout: 10000 });
  35  | 
  36  |     // Get file input (even though it's hidden, we can still interact with it)
  37  |     const fileInput = page.locator('input[type="file"]');
  38  | 
  39  |     // Upload test document
  40  |     console.log('Uploading test document');
  41  |     const testFilePath = TEST_FILE;
  42  |     console.log('Using file path:', testFilePath);
  43  |     await fileInput.setInputFiles(testFilePath);
  44  | 
  45  |     // Wait for document to be uploaded and processed
  46  |     await page.waitForTimeout(3000);
  47  | 
  48  |     // Verify document name appears somewhere on the page
> 49  |     await expect(page.locator('text=Loan_Policy')).toBeVisible({ timeout: 15000 });
      |                                                    ^ Error: expect(locator).toBeVisible() failed
  50  | 
  51  |     // Wait for "Ready for questions" badge to appear
  52  |     const readyBadge = page.locator('text=Ready for questions');
  53  |     await expect(readyBadge).toBeVisible({ timeout: 30000 });
  54  |     console.log('Document ready for questions');
  55  | 
  56  |     // Ask a question about the loan agreement
  57  |     const chatTextarea = page.locator('textarea');
  58  |     await chatTextarea.fill('What is the loan amount in the agreement?');
  59  |     console.log('Filled question');
  60  | 
  61  |     // Send message using Enter key
  62  |     await page.keyboard.press('Enter');
  63  |     console.log('Sent message');
  64  | 
  65  |     // Wait for response to appear
  66  |     await page.waitForTimeout(3000);
  67  | 
  68  |     // Verify response contains the expected text
  69  |     const responseArea = page.locator('div:has-text("5,000,000")');
  70  |     await expect(responseArea).toBeVisible({ timeout: 30000 });
  71  |     console.log('Response contains loan amount');
  72  | 
  73  |     // Verify source attribution is present (look for the source chip with description icon)
  74  |     const sourceChip = page.locator('span:has-text("Loan_Policy")');
  75  |     await expect(sourceChip).toBeVisible({ timeout: 10000 });
  76  |     console.log('✓ Source attribution verified: uploaded document is properly cited');
  77  | 
  78  |     // Verify the source is visible in the chat
  79  |     const chatBody = page.locator('body');
  80  |     const chatText = await chatBody.textContent();
  81  |     expect(chatText).toContain('Loan_Policy');
  82  |     expect(chatText).toContain('5,000,000');
  83  | 
  84  |     console.log('✓ Session-aware RAG test passed: uploaded document prioritized and properly attributed');
  85  |   });
  86  | 
  87  |   test('should return to uploaded document on follow-up question', async ({ page }) => {
  88  |     // Navigate to Chat
  89  |     await page.goto(`${BASE_URL}/chat`);
  90  |     await page.waitForURL(`${BASE_URL}/chat`, { timeout: 10000 });
  91  | 
  92  |     // Wait for textarea to appear
  93  |     const textarea = page.locator('textarea');
  94  |     await expect(textarea).toBeVisible({ timeout: 10000 });
  95  | 
  96  |     // Upload test document
  97  |     const fileInput = page.locator('input[type="file"]');
  98  |     const testFilePath = TEST_FILE;
  99  |     await fileInput.setInputFiles(testFilePath);
  100 |     await page.waitForTimeout(3000);
  101 | 
  102 |     // Wait for ready badge
  103 |     const readyBadge = page.locator('text=Ready for questions');
  104 |     await expect(readyBadge).toBeVisible({ timeout: 30000 });
  105 | 
  106 |     // First question - interest rate
  107 |     const chatTextarea = page.locator('textarea');
  108 |     await chatTextarea.fill('What is the interest rate?');
  109 |     await page.keyboard.press('Enter');
  110 |     await page.waitForTimeout(3000);
  111 | 
  112 |     // Verify first response contains interest rate
  113 |     const firstResponse = page.locator('body');
  114 |     let bodyText = await firstResponse.textContent();
  115 |     expect(bodyText).toContain('8.5');
  116 |     console.log('✓ First question answered: interest rate found');
  117 | 
  118 |     // Second question - monthly payments
  119 |     await chatTextarea.fill('What are the monthly payments?');
  120 |     await page.keyboard.press('Enter');
  121 |     await page.waitForTimeout(3000);
  122 | 
  123 |     // Verify second response contains payment amount
  124 |     bodyText = await firstResponse.textContent();
  125 |     expect(bodyText).toContain('157,500');
  126 |     console.log('✓ Second question answered: payment amount found');
  127 | 
  128 |     // Verify both responses cite the uploaded document
  129 |     const sourceElement = page.locator('span:has-text("Loan_Policy")');
  130 |     expect(await sourceElement.count()).toBeGreaterThan(0);
  131 | 
  132 |     console.log('✓ Follow-up question test passed: session context maintained across queries');
  133 |   });
  134 | 
  135 |   test('should extract and cite specific document content', async ({ page }) => {
  136 |     // Navigate to Chat
  137 |     await page.goto(`${BASE_URL}/chat`);
  138 |     await page.waitForURL(`${BASE_URL}/chat`, { timeout: 10000 });
  139 | 
  140 |     // Wait for textarea
  141 |     const textarea = page.locator('textarea');
  142 |     await expect(textarea).toBeVisible({ timeout: 10000 });
  143 | 
  144 |     // Upload document
  145 |     const fileInput = page.locator('input[type="file"]');
  146 |     const testFilePath = TEST_FILE;
  147 |     await fileInput.setInputFiles(testFilePath);
  148 |     await page.waitForTimeout(3000);
  149 | 
```