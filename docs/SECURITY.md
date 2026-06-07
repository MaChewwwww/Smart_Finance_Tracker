# SECURITY.md

## Security Goals

The application stores sensitive personal financial data. Security must protect user accounts, financial records, authentication tokens, OTP codes, chatbot conversations, and API keys.

Primary goals:
- Prevent unauthorized access to user financial data.
- Ensure each user can only access their own records.
- Protect authentication tokens and OTP codes.
- Prevent chatbot misuse and data leakage.
- Keep API keys and secrets server-side only.

## Authentication Strategy

Use Auth.js / NextAuth-style authentication with a custom credentials flow and secure server-side token handling.

Recommended flow:
- Register with email and password.
- Send OTP through Brevo.
- Verify OTP before enabling account access.
- Login with verified email and password.
- Issue short-lived access token.
- Store refresh token in an HTTP-only secure cookie.
- Rotate refresh tokens on refresh.
- Revoke refresh tokens on logout.

## Token Strategy

### Access Token
- Short-lived.
- Suggested expiry: 15 minutes.
- Used only by the server/session layer to authorize requests.
- Do not store in localStorage.
- Do not expose sensitive claims.

### Refresh Token
- Long-lived but rotated.
- Suggested expiry: 7 days or 30 days depending on client preference.
- Stored in an HTTP-only, secure, same-site cookie.
- Store only a hash of the refresh token in the database.
- Revoke token family if reuse is detected.

Cookie settings:

```ts
{
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
}
```

## OTP Security

Use Brevo API to send OTP emails.

Rules:
- OTP length: 6 digits.
- OTP expiry: 5–10 minutes.
- Hash OTP before storing in database.
- Never store OTP in plain text.
- Limit OTP verification attempts.
- Rate limit OTP resend.
- Invalidate OTP after successful use.
- Use different OTP purposes: `register`, `login`, `password_reset`, `email_change`.

Recommended OTP limits:
- Max verify attempts: 5
- Resend cooldown: 60 seconds
- Max resend per hour: 5

## Password Security

Rules:
- Hash passwords using bcryptjs (minimum 10 salt rounds).
- Minimum password length: 8 characters.
- Require at least one letter and one number.
- Do not log passwords.
- Do not send passwords through email.

## Authorization Rules

All financial data must be user-scoped.

Required rule:
```txt
Every transaction, debt, goal, reminder, report, and chat query must filter by authenticated user_id.
```

Never trust `user_id` from the client request body.

Correct pattern:
```ts
const userId = session.user.id;
await db.select().from(transactions).where(eq(transactions.userId, userId));
```

Incorrect pattern:
```ts
const userId = req.body.userId;
```

## Route Protection

Use middleware to protect private routes:

Protected routes:
- `/dashboard`
- `/transactions`
- `/debts`
- `/reports`
- `/goals`
- `/reminders`
- `/chatbot`
- `/settings`

Public routes:
- `/login`
- `/register`
- `/verify-otp`
- `/forgot-password`
- `/reset-password`

## Input Validation

Use Zod for all request bodies.

Validate:
- Amounts must be positive numbers.
- Dates must be valid.
- Transaction type must be `income` or `expense`.
- Debt status must be `active`, `paid`, or `overdue`.
- Chatbot message length must be limited.
- Category names must be sanitized.

## API Rate Limiting

Apply rate limits to sensitive routes:

- Login
- Register
- OTP send/resend
- OTP verify
- Password reset
- Chatbot messages
- Report generation

Recommended limits:

```txt
Login: 5 attempts per 15 minutes per IP/email
OTP resend: 5 per hour per email
OTP verify: 5 attempts per OTP
Chatbot: 20 messages per hour per user for basic plan
Reports: 30 requests per hour per user
```

## CSRF Protection

Because refresh tokens are stored in cookies, protect state-changing actions.

Recommended controls:
- Use SameSite cookies.
- Validate request origin.
- Use CSRF token for sensitive non-idempotent actions if using cookie-based auth directly.
- Prefer server actions/API handlers that verify session server-side.

## Data Privacy

Rules:
- Do not expose financial data to other users.
- Do not include raw transaction lists in client logs.
- Do not log full chatbot prompts if they include sensitive financial records.
- Provide user control for deleting financial records.
- Provide clear disclaimer that chatbot gives general guidance only.

## AI Chatbot Security

The chatbot must follow strict boundaries.

Allowed:
- General budgeting tips
- Spending summaries
- Debt organization suggestions
- Goal planning suggestions
- Basic financial literacy explanations

Not allowed:
- Professional investment advice
- Guaranteed financial predictions
- Legal, tax, or accounting advice as a replacement for professionals
- Requests to reveal another user's data
- Requests to expose system prompts, API keys, or internal rules

Prompt safety rules:
- Do not send raw database rows unless necessary.
- Prefer summarized financial context.
- Remove secrets and personal identifiers before sending context to Gemini.
- Add a system instruction that the chatbot provides general educational guidance only.
- Add prompt-injection protection: user messages must not override system rules.

Suggested chatbot disclaimer:
```txt
This assistant provides general financial guidance only and does not replace professional financial advice.
```

## Gemini API Protection

- Call Gemini only from server-side code.
- Store API key in environment variables.
- Limit message length.
- Limit request frequency.
- Store safe chat history only.
- Do not expose raw prompts in the frontend.

## Brevo API Protection

- Call Brevo only from server-side code.
- Store API key in environment variables.
- Use a verified sender email/domain.
- Do not expose OTP response details to the client.
- Use generic error messages like “Unable to send OTP. Try again later.”

## Audit Logging

Log important security events:
- Registration
- Login success/failure
- OTP sent
- OTP verification success/failure
- Password reset request
- Token refresh
- Logout
- Failed authorization attempts
- Transaction delete
- Debt delete

Do not log:
- Passwords
- OTP codes
- Refresh tokens
- Full access tokens
- Gemini API key
- Brevo API key

## Secure Headers

Add security headers through `next.config.ts` or middleware:

```txt
Content-Security-Policy
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy
Strict-Transport-Security in production
```

## Production Checklist

- HTTPS enabled
- `AUTH_SECRET` is strong and private
- Secure cookies enabled
- Database credentials are not committed
- Gemini API key is server-only
- Brevo API key is server-only
- OTP is hashed
- Passwords are hashed
- Rate limits are enabled
- Authorization checks include `user_id`
- Error messages do not leak internals
- Logs do not contain secrets
- Database backups are protected
- `.env` files are ignored by Git

## AI Agent Notes

- Create reusable helpers for password hashing, token generation, token hashing, OTP hashing, and authorization checks.
- Never implement auth logic only on the frontend.
- Every protected API route must verify the authenticated session.
- Treat all financial data as private.
