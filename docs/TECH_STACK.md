# TECH_STACK.md

## Project
Smart Finance Tracker with AI Assistant — a responsive web application for personal finance tracking, debt monitoring, financial reporting, forecasting, reminders, and AI-assisted financial guidance.

## Recommended Stack

### Core Application
- **Framework:** Next.js App Router
- **Language:** TypeScript
- **UI Styling:** Tailwind CSS
- **Component System:** shadcn/ui
- **ORM:** Drizzle ORM
- **Database:** MySQL
- **Database Driver:** mysql2
- **Authentication:** Auth.js / NextAuth-style authentication flow with credentials, OTP verification, and secure cookies
- **HTTP Client:** Axios for client-to-server and server-to-external API calls when needed
- **AI Provider:** Gemini API
- **Email / OTP Provider:** Brevo API
- **Containerization:** Docker and Docker Compose
- **Validation:** Zod
- **Forms:** React Hook Form + Zod Resolver
- **Charts:** Recharts
- **Tables:** TanStack Table
- **Date Utilities:** date-fns
- **Icons:** lucide-react
- **Password Hashing:** bcrypt or argon2
- **Rate Limiting:** Upstash Redis or local Redis for production abuse control
- **Testing:** Vitest, React Testing Library, Playwright
- **Linting / Formatting:** ESLint, Prettier

## Package Installation

### Create Next.js Project
```bash
npx create-next-app@latest smart-finance-tracker \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
```

### Core Dependencies
```bash
npm install drizzle-orm mysql2 zod axios bcryptjs date-fns lucide-react recharts
npm install react-hook-form @hookform/resolvers
npm install @tanstack/react-table
npm install @google/generative-ai
npm install nodemailer
npm install jose
```

### Development Dependencies
```bash
npm install -D drizzle-kit prettier vitest @testing-library/react @testing-library/jest-dom playwright
```

### Auth Dependencies
```bash
npm install next-auth @auth/drizzle-adapter
```

> Note: Auth.js has first-party Drizzle adapter support. For MySQL, use Drizzle with the `mysql2` driver and define the Auth.js schema tables together with your application schema.

### shadcn/ui Setup
```bash
npx shadcn@latest init
```

### Install All shadcn/ui Components
```bash
npx shadcn@latest add --all
```

### Recommended shadcn/ui Components for This App
If you do not want to install everything, install only the needed components:

```bash
npx shadcn@latest add button input label form card dialog sheet drawer dropdown-menu select textarea table tabs badge alert separator skeleton toast sonner calendar popover command avatar progress chart switch checkbox radio-group scroll-area
```

## Environment Variables

Create `.env.local` for development:

```env
# App
NEXT_PUBLIC_APP_NAME="Smart Finance Tracker"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# Database
DATABASE_URL="mysql://root:password@localhost:3306/smart_finance_tracker"

# Auth
AUTH_SECRET="replace-with-long-random-secret"
AUTH_URL="http://localhost:3000"
ACCESS_TOKEN_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN_DAYS="7"

# Brevo OTP Email
BREVO_API_KEY="replace-with-brevo-key"
BREVO_SENDER_EMAIL="noreply@yourdomain.com"
BREVO_SENDER_NAME="Smart Finance Tracker"

# Gemini AI
GEMINI_API_KEY="replace-with-gemini-api-key"
GEMINI_MODEL="gemini-1.5-flash"

# Optional Redis Rate Limit
REDIS_URL="redis://localhost:6379"
```

## Suggested Folder Structure

```txt
src/
  app/
    (auth)/
      login/
      register/
      verify-otp/
    (dashboard)/
      dashboard/
      transactions/
      debts/
      reports/
      goals/
      chatbot/
      settings/
    api/
      auth/
      chatbot/
      transactions/
      debts/
      reports/
      reminders/
  components/
    ui/
    layout/
    dashboard/
    transactions/
    debts/
    reports/
    chatbot/
    forms/
  db/
    schema/
    migrations/
    index.ts
  features/
    auth/
    transactions/
    debts/
    reports/
    forecasting/
    chatbot/
    reminders/
  lib/
    auth.ts
    env.ts
    gemini.ts
    brevo.ts
    security.ts
    validators.ts
    utils.ts
  middleware.ts
```

## Database Tables

Recommended main tables:

- `users`
- `otp_verifications`
- `refresh_tokens`
- `accounts` and `sessions` if using Auth.js database sessions
- `categories`
- `transactions`
- `debts`
- `debt_payments`
- `financial_goals`
- `budgets`
- `reminders`
- `chat_sessions`
- `chat_messages`
- `audit_logs`

## Third-Party Service Responsibilities

### Gemini API
Used only for AI assistant responses, budget suggestions, spending pattern explanations, and simple financial guidance.

### Brevo API
Used for OTP delivery, account verification, login verification, password reset, and optional financial reminders.

### Redis
Used for rate limiting login, OTP, chatbot, and sensitive endpoints.

## Deployment Stack

### Development
- Next.js dev server
- MySQL container through Docker Compose
- Optional Redis container

### Production
- Next.js deployed on Vercel, Railway, Render, DigitalOcean, or VPS
- Managed MySQL or MySQL container
- Environment variables set in hosting platform
- HTTPS enabled
- Secure cookies enabled

## Docker Compose Services

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env.local
    depends_on:
      - mysql
      - redis

  mysql:
    image: mysql:8.4
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: smart_finance_tracker
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    ports:
      - "6379:6379"

volumes:
  mysql_data:
```

## AI Agent Notes

- Use TypeScript everywhere.
- Keep business logic inside `features/*` modules, not directly inside pages.
- Use server actions or API routes for mutations.
- Validate all incoming request bodies with Zod.
- Never call Gemini directly from the browser.
- Never expose financial data, tokens, OTP codes, or API keys to the client.
- Keep access tokens short-lived and refresh tokens in secure HTTP-only cookies.
