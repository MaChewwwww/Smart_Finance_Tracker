import "dotenv/config";
import { db, pool } from "./index";
import { users, categories, transactions, financialGoals, debts, debtPayments } from "./schema";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";

async function seed() {
    console.log("Seeding database...");

    // Create seeder account
    const passwordHash = await bcrypt.hash("Password123!", 10);
    const userId = crypto.randomUUID();

    await db.insert(users).values({
        id: userId,
        name: "Demo User",
        email: "demo@example.com",
        passwordHash,
    });
    console.log(`User created: demo@example.com / password123`);

    // Create Categories
    const incomeCategories = ["Salary", "Freelance", "Investment"];
    const expenseCategories = ["Groceries", "Rent", "Utilities", "Entertainment", "Dining Out", "Transportation"];

    const categoryIds: { [key: string]: string } = {};

    for (const name of incomeCategories) {
        const id = crypto.randomUUID();
        await db.insert(categories).values({
            id,
            userId,
            name,
            type: "income",
            color: "#10b981", // emerald-500
        });
        categoryIds[name] = id;
    }

    for (const name of expenseCategories) {
        const id = crypto.randomUUID();
        await db.insert(categories).values({
            id,
            userId,
            name,
            type: "expense",
            color: "#ef4444", // red-500
        });
        categoryIds[name] = id;
    }
    console.log("Categories created.");

    // Create Transactions
    const today = new Date();
    const transactionsData = [];

    // Add Salary
    transactionsData.push({
        id: crypto.randomUUID(),
        userId,
        categoryId: categoryIds["Salary"],
        type: "income",
        amount: "5000.00",
        description: "Monthly Salary",
        transactionDate: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0],
    });

    // Add Expenses
    for (let i = 1; i <= 20; i++) {
        const randomExpense = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
        const amount = (Math.random() * 100 + 10).toFixed(2);
        const day = Math.floor(Math.random() * 28) + 1;
        const txDate = new Date(today.getFullYear(), today.getMonth(), day).toISOString().split('T')[0];

        transactionsData.push({
            id: crypto.randomUUID(),
            userId,
            categoryId: categoryIds[randomExpense],
            type: "expense",
            amount,
            description: `Payment for ${randomExpense}`,
            transactionDate: txDate,
        });
    }

    await db.insert(transactions).values(transactionsData);
    console.log(`Inserted ${transactionsData.length} transactions.`);

    // Create Financial Goal
    await db.insert(financialGoals).values({
        id: crypto.randomUUID(),
        userId,
        name: "Emergency Fund",
        targetAmount: "10000.00",
        currentAmount: "2500.00",
        status: "active",
    });
    console.log("Financial goal created.");

    // Create Debt
    const debtId = crypto.randomUUID();
    await db.insert(debts).values({
        id: debtId,
        userId,
        creditorName: "Credit Card",
        originalAmount: "3000.00",
        remainingAmount: "2500.00",
        status: "active",
    });

    await db.insert(debtPayments).values({
        id: crypto.randomUUID(),
        debtId,
        userId,
        amount: "500.00",
        paymentDate: new Date(today.getFullYear(), today.getMonth(), 15).toISOString().split('T')[0],
    });
    console.log("Debt and payments created.");

    console.log("Database seeded successfully!");

    // Close connection pool
    await pool.end();
}

seed().catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
});
