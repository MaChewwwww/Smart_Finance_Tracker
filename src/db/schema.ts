import { mysqlTable, varchar, text, decimal, timestamp, int, date, index, uniqueIndex } from "drizzle-orm/mysql-core";
import { relations, sql } from "drizzle-orm";

// 1. Users Table
export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  emailVerifiedAt: timestamp("email_verified_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
}, (table) => ({
  emailIdx: uniqueIndex("email_idx").on(table.email),
}));

// 2. OTP Verifications Table
export const otpVerifications = mysqlTable("otp_verifications", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).references(() => users.id, { onDelete: "cascade" }),
  email: varchar("email", { length: 255 }).notNull(),
  codeHash: varchar("code_hash", { length: 255 }).notNull(),
  purpose: varchar("purpose", { length: 50 }).notNull(), // 'register' | 'login' | 'password_reset'
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  attemptCount: int("attempt_count").default(0).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  emailIdx: index("otp_email_idx").on(table.email),
}));

// 3. Refresh Tokens Table
export const refreshTokens = mysqlTable("refresh_tokens", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: varchar("token_hash", { length: 255 }).notNull(),
  familyId: varchar("family_id", { length: 36 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  revokedAt: timestamp("revoked_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  replacedByTokenId: varchar("replaced_by_token_id", { length: 36 }),
}, (table) => ({
  tokenHashIdx: uniqueIndex("token_hash_idx").on(table.tokenHash),
  userIdIdx: index("rt_user_id_idx").on(table.userId),
}));

// 4. Categories Table
export const categories = mysqlTable("categories", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).references(() => users.id, { onDelete: "cascade" }), // null for system default
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // 'income' | 'expense'
  color: varchar("color", { length: 50 }),
  icon: varchar("icon", { length: 50 }),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  userIdIdx: index("cat_user_id_idx").on(table.userId),
}));

// 5. Transactions Table
export const transactions = mysqlTable("transactions", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  categoryId: varchar("category_id", { length: 36 }).references(() => categories.id, { onDelete: "set null" }),
  type: varchar("type", { length: 20 }).notNull(), // 'income' | 'expense'
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  description: text("description"),
  transactionDate: date("transaction_date", { mode: "string" }).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
}, (table) => ({
  userIdIdx: index("tx_user_id_idx").on(table.userId),
  dateIdx: index("tx_date_idx").on(table.transactionDate),
}));

// 6. Debts Table
export const debts = mysqlTable("debts", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  creditorName: varchar("creditor_name", { length: 255 }).notNull(),
  originalAmount: decimal("original_amount", { precision: 15, scale: 2 }).notNull(),
  remainingAmount: decimal("remaining_amount", { precision: 15, scale: 2 }).notNull(),
  dueDate: date("due_date", { mode: "string" }),
  status: varchar("status", { length: 50 }).default("active").notNull(), // 'active' | 'paid' | 'overdue'
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
}, (table) => ({
  userIdIdx: index("debt_user_id_idx").on(table.userId),
}));

// 7. Debt Payments Table
export const debtPayments = mysqlTable("debt_payments", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  debtId: varchar("debt_id", { length: 36 }).notNull().references(() => debts.id, { onDelete: "cascade" }),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  paymentDate: date("payment_date", { mode: "string" }).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  debtIdIdx: index("payment_debt_id_idx").on(table.debtId),
  userIdIdx: index("payment_user_id_idx").on(table.userId),
}));

// 8. Financial Goals Table
export const financialGoals = mysqlTable("financial_goals", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  targetAmount: decimal("target_amount", { precision: 15, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 15, scale: 2 }).default("0.00").notNull(),
  targetDate: date("target_date", { mode: "string" }),
  status: varchar("status", { length: 50 }).default("active").notNull(), // 'active' | 'completed'
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  userIdIdx: index("goal_user_id_idx").on(table.userId),
}));

// 9. Reminders Table
export const reminders = mysqlTable("reminders", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(), // 'debt' | 'budget' | 'goal'
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  remindAt: timestamp("remind_at").notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(), // 'pending' | 'sent' | 'dismissed'
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  userIdIdx: index("reminder_user_id_idx").on(table.userId),
  remindAtIdx: index("reminder_remind_at_idx").on(table.remindAt),
}));

// 10. Chat Sessions Table
export const chatSessions = mysqlTable("chat_sessions", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
}, (table) => ({
  userIdIdx: index("chat_session_user_idx").on(table.userId),
}));

// 11. Chat Messages Table
export const chatMessages = mysqlTable("chat_messages", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  chatSessionId: varchar("chat_session_id", { length: 36 }).notNull().references(() => chatSessions.id, { onDelete: "cascade" }),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 50 }).notNull(), // 'user' | 'model'
  content: text("content").notNull(),
  metadataJson: text("metadata_json"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  sessionIdIdx: index("message_session_idx").on(table.chatSessionId),
}));

// 12. Audit Logs Table
export const auditLogs = mysqlTable("audit_logs", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).references(() => users.id, { onDelete: "set null" }),
  action: varchar("action", { length: 255 }).notNull(), // e.g. 'register', 'login_success', 'delete_transaction'
  entityType: varchar("entity_type", { length: 50 }),
  entityId: varchar("entity_id", { length: 36 }),
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  userIdIdx: index("audit_user_idx").on(table.userId),
}));

// Relationships
export const usersRelations = relations(users, ({ many }) => ({
  otpVerifications: many(otpVerifications),
  refreshTokens: many(refreshTokens),
  categories: many(categories),
  transactions: many(transactions),
  debts: many(debts),
  debtPayments: many(debtPayments),
  financialGoals: many(financialGoals),
  reminders: many(reminders),
  chatSessions: many(chatSessions),
  auditLogs: many(auditLogs),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, { fields: [categories.userId], references: [users.id] }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
  category: one(categories, { fields: [transactions.categoryId], references: [categories.id] }),
}));

export const debtsRelations = relations(debts, ({ one, many }) => ({
  user: one(users, { fields: [debts.userId], references: [users.id] }),
  payments: many(debtPayments),
}));

export const debtPaymentsRelations = relations(debtPayments, ({ one }) => ({
  debt: one(debts, { fields: [debtPayments.debtId], references: [debts.id] }),
  user: one(users, { fields: [debtPayments.userId], references: [users.id] }),
}));

export const financialGoalsRelations = relations(financialGoals, ({ one }) => ({
  user: one(users, { fields: [financialGoals.userId], references: [users.id] }),
}));

export const remindersRelations = relations(reminders, ({ one }) => ({
  user: one(users, { fields: [reminders.userId], references: [users.id] }),
}));

export const chatSessionsRelations = relations(chatSessions, ({ one, many }) => ({
  user: one(users, { fields: [chatSessions.userId], references: [users.id] }),
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  session: one(chatSessions, { fields: [chatMessages.chatSessionId], references: [chatSessions.id] }),
  user: one(users, { fields: [chatMessages.userId], references: [users.id] }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, { fields: [auditLogs.userId], references: [users.id] }),
}));
