# ARCHITECTURE.md

## System Overview
Smart Finance Tracker with AI Assistant is a responsive web application that helps users record income, expenses, debts, budgets, financial goals, reminders, and reports. It also includes an AI chatbot that provides general financial guidance, budget tips, spending insights, and goal suggestions.

The application is designed as a modular Next.js system with clearly separated domains for authentication, transactions, debts, reports, forecasting, reminders, and chatbot features.

## Architecture Style

Use a **modular monolith architecture** for the first production version.

Reasons:
- The project is student/client-friendly and easier to deploy.
- Next.js can handle UI, API routes, server actions, middleware, and authentication in one codebase.
- Modules can be separated by feature without the overhead of microservices.
- The architecture can later evolve into separate services if chatbot or forecasting workloads grow.

## High-Level Architecture

```txt
User Browser
  |
  | HTTPS
  v
Next.js Web App
  |-- App Router Pages
  |-- Server Components
  |-- API Routes / Server Actions
  |-- Middleware Auth Guard
  |
  |---- MySQL via Drizzle ORM
  |---- Brevo API for OTP and email reminders
  |---- Gemini API for chatbot responses
  |---- Redis for rate limiting and temporary security state
```

## Main Modules

### 1. Authentication Module
Responsibilities:
- User registration
- Login
- OTP verification through Brevo
- Password hashing
- Session handling
- Access token and refresh token management
- Logout and token revocation

Recommended pages:
- `/register`
- `/login`
- `/verify-otp`
- `/forgot-password`
- `/reset-password`

Recommended API routes:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/verify-otp`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

### 2. Dashboard Module
Responsibilities:
- Show total income
- Show total expenses
- Show balance
- Show active debts
- Show savings progress
- Show recent transactions
- Show monthly spending chart

Recommended route:
- `/dashboard`

### 3. Transaction Module
Responsibilities:
- Add income records
- Add expense records
- Edit transactions
- Delete transactions
- Categorize transactions
- Filter by date, category, amount, and type

Recommended routes:
- `/transactions`
- `/transactions/new`
- `/transactions/[id]/edit`

### 4. Category Module
Responsibilities:
- Default expense categories such as food, bills, transportation, savings, school, health, entertainment, and others
- User-created custom categories
- Category-based reports

### 5. Debt Management Module
Responsibilities:
- Add debts
- Track debt amount, due date, creditor, status, and notes
- Record partial payments
- Mark debts as paid
- Show upcoming debt reminders

Recommended route:
- `/debts`

### 6. Reports Module
Responsibilities:
- Generate daily, weekly, monthly, and yearly summaries
- Show spending by category
- Show income vs expense trends
- Export reports if needed
- Provide financial insights from existing data

Recommended route:
- `/reports`

### 7. Forecasting Module
Responsibilities:
- Analyze past income and expenses
- Estimate future spending trends
- Give simple budget warnings
- Display projected balance

Initial implementation:
- Use rule-based forecasting first.
- Calculate monthly averages by category.
- Predict next-month expenses using recent average spending.
- Later improve with more advanced statistical forecasting.

### 8. AI Chatbot Module
Responsibilities:
- Answer general financial questions
- Explain dashboard insights
- Suggest budgeting improvements
- Help users set financial goals
- Give reminders and tips
- Refuse professional financial advice requests

Recommended route:
- `/chatbot`

Recommended API route:
- `POST /api/chatbot/message`

### 9. Reminder Module
Responsibilities:
- Financial reminders
- Debt due date reminders
- Budget warning reminders
- Goal progress reminders

Initial implementation:
- In-app reminders stored in MySQL.
- Optional email reminders through Brevo.

### 10. Settings Module
Responsibilities:
- Profile settings
- Password update
- Notification preferences
- Data export/delete options
- AI assistant preferences

## Data Flow Examples

### Register with OTP
```txt
User submits registration form
  -> Server validates data with Zod
  -> Server hashes password
  -> Server creates pending user or OTP record
  -> Server sends OTP through Brevo
  -> User submits OTP
  -> Server verifies OTP
  -> Account becomes verified
  -> User can log in
```

### Add Expense
```txt
User submits expense form
  -> Server validates request
  -> Auth middleware confirms user session
  -> Drizzle inserts transaction into MySQL
  -> Dashboard and reports query updated values
```

### Chatbot Message
```txt
User sends message
  -> API route validates message
  -> Server loads safe user financial summary
  -> Server builds Gemini prompt
  -> Gemini returns response
  -> Server stores chat message and response
  -> UI displays assistant answer
```

## Recommended Database Model

### users
- `id`
- `name`
- `email`
- `password_hash`
- `email_verified_at`
- `created_at`
- `updated_at`

### otp_verifications
- `id`
- `user_id`
- `email`
- `code_hash`
- `purpose`
- `expires_at`
- `used_at`
- `attempt_count`
- `created_at`

### refresh_tokens
- `id`
- `user_id`
- `token_hash`
- `family_id`
- `expires_at`
- `revoked_at`
- `created_at`
- `replaced_by_token_id`

### categories
- `id`
- `user_id`
- `name`
- `type`
- `color`
- `icon`
- `created_at`

### transactions
- `id`
- `user_id`
- `category_id`
- `type` — income or expense
- `amount`
- `description`
- `transaction_date`
- `created_at`
- `updated_at`

### debts
- `id`
- `user_id`
- `creditor_name`
- `original_amount`
- `remaining_amount`
- `due_date`
- `status`
- `notes`
- `created_at`
- `updated_at`

### debt_payments
- `id`
- `debt_id`
- `user_id`
- `amount`
- `payment_date`
- `created_at`

### financial_goals
- `id`
- `user_id`
- `name`
- `target_amount`
- `current_amount`
- `target_date`
- `status`
- `created_at`

### reminders
- `id`
- `user_id`
- `type`
- `title`
- `message`
- `remind_at`
- `status`
- `created_at`

### chat_sessions
- `id`
- `user_id`
- `title`
- `created_at`
- `updated_at`

### chat_messages
- `id`
- `chat_session_id`
- `user_id`
- `role`
- `content`
- `metadata_json`
- `created_at`

### audit_logs
- `id`
- `user_id`
- `action`
- `entity_type`
- `entity_id`
- `ip_address`
- `user_agent`
- `created_at`

## Access Control

All financial records must be scoped by `user_id`.

Rules:
- A user can only read, create, update, or delete their own records.
- Every query for transactions, debts, goals, reminders, and chat history must include `where user_id = session.user.id`.
- Never trust a user ID from the client body.
- Use the authenticated session as the source of truth.

## Frontend Architecture

Use route groups:

```txt
app/
  (auth)/
  (dashboard)/
```

Use shared layouts:
- Auth layout for login/register pages
- Dashboard layout with sidebar, topbar, mobile navigation, and responsive content wrapper

Use responsive design:
- Desktop: sidebar + card dashboard grid
- Tablet: collapsible sidebar
- Mobile: bottom navigation or drawer navigation

## API Design Principles

- Use REST-style endpoints for CRUD features.
- Use `POST` for actions such as OTP verification, chatbot messaging, and token refresh.
- Validate every request with Zod.
- Return consistent response shapes.

Example response:

```ts
{
  success: true,
  data: {},
  message: "Transaction created successfully"
}
```

Error response:

```ts
{
  success: false,
  error: {
    code: "VALIDATION_ERROR",
    message: "Invalid amount"
  }
}
```

## AI Agent Rules

- Keep each feature isolated inside `features/[feature-name]`.
- Avoid mixing UI, validation, database queries, and business logic in a single file.
- Create reusable services for Gemini, Brevo, auth tokens, and reports.
- Prefer server-side data fetching for private financial data.
- Never expose Gemini API key or Brevo API key to the frontend.
