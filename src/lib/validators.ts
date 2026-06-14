import { z } from "zod";

// Password requirements: Min 8 chars, at least one letter and one number
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[a-zA-Z]/, "Password must contain at least one letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  email: z.string().email("Invalid email address"),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const verifyOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
  code: z.string().length(6, "Verification code must be exactly 6 digits"),
  purpose: z.enum(["register", "login", "password_reset"]),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  code: z.string().length(6, "Verification code must be exactly 6 digits"),
  password: passwordSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// Transactions
// transaction_date is a DATE column; accept a YYYY-MM-DD string.
const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");

export const createTransactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.coerce
    .number()
    .positive("Amount must be greater than 0")
    .max(99999999999.99, "Amount is too large"),
  categoryId: z.string().uuid("Invalid category").optional().nullable(),
  description: z.string().max(1000, "Description is too long").optional().nullable(),
  transactionDate: dateStringSchema,
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const transactionFilterSchema = z.object({
  type: z.enum(["income", "expense"]).optional(),
  categoryId: z.string().uuid().optional(),
  search: z.string().max(255).optional(),
  from: dateStringSchema.optional(),
  to: dateStringSchema.optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
// Raw form-input shape (before zod coercion runs) — used to type react-hook-form.
export type CreateTransactionFormInput = z.input<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionFilterInput = z.infer<typeof transactionFilterSchema>;

// ─── Debts ───────────────────────────────────────────────────────────────────

const optionalDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
  .optional()
  .nullable();

export const createDebtSchema = z.object({
  creditorName: z.string().min(1, "Creditor name is required").max(255, "Creditor name is too long"),
  originalAmount: z.coerce
    .number()
    .positive("Amount must be greater than 0")
    .max(99999999999.99, "Amount is too large"),
  remainingAmount: z.coerce
    .number()
    .min(0, "Remaining amount cannot be negative")
    .max(99999999999.99, "Amount is too large"),
  dueDate: optionalDateString,
  notes: z.string().max(2000, "Notes are too long").optional().nullable(),
});

export const updateDebtSchema = createDebtSchema.partial();

export const logDebtPaymentSchema = z.object({
  amount: z.coerce
    .number()
    .positive("Payment amount must be greater than 0")
    .max(99999999999.99, "Amount is too large"),
  paymentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
});

export type CreateDebtInput = z.infer<typeof createDebtSchema>;
export type CreateDebtFormInput = z.input<typeof createDebtSchema>;
export type UpdateDebtInput = z.infer<typeof updateDebtSchema>;
export type LogDebtPaymentInput = z.infer<typeof logDebtPaymentSchema>;
export type LogDebtPaymentFormInput = z.input<typeof logDebtPaymentSchema>;

// ─── Goals ───────────────────────────────────────────────────────────────────

export const createGoalSchema = z.object({
  name: z.string().min(1, "Goal name is required").max(255, "Name is too long"),
  targetAmount: z.coerce
    .number()
    .positive("Target amount must be greater than 0")
    .max(99999999999.99, "Amount is too large"),
  currentAmount: z.coerce
    .number()
    .min(0, "Current amount cannot be negative")
    .max(99999999999.99, "Amount is too large")
    .optional()
    .default(0),
  targetDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional()
    .nullable(),
  notes: z.string().max(2000, "Notes are too long").optional().nullable(),
});

export const updateGoalSchema = createGoalSchema.omit({ currentAmount: true }).partial();

export const contributeGoalSchema = z.object({
  amount: z.coerce
    .number()
    .positive("Contribution must be greater than 0")
    .max(99999999999.99, "Amount is too large"),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type CreateGoalFormInput = z.input<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type ContributeGoalInput = z.infer<typeof contributeGoalSchema>;

// ─── Chatbot ─────────────────────────────────────────────────────────────────

export const chatMessageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(1000, "Message is too long"),
  sessionId: z.string().uuid("Invalid session ID").optional().nullable(),
});

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
