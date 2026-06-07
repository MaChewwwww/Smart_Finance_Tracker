import { db } from "@/db";
import { categories } from "@/db/schema";

/**
 * Seeds a fresh user with standard default budget categories.
 */
export async function seedDefaultCategories(userId: string) {
  const defaultCats = [
    // Income Categories
    { name: "Salary", type: "income", color: "#10B981", icon: "briefcase" },
    { name: "Freelance", type: "income", color: "#34D399", icon: "laptop" },
    { name: "Investments", type: "income", color: "#6EE7B7", icon: "trending-up" },
    { name: "Other Income", type: "income", color: "#A7F3D0", icon: "plus" },
    
    // Expense Categories
    { name: "Food", type: "expense", color: "#EF4444", icon: "utensils" },
    { name: "Bills", type: "expense", color: "#3B82F6", icon: "credit-card" },
    { name: "Transportation", type: "expense", color: "#F59E0B", icon: "car" },
    { name: "School", type: "expense", color: "#8B5CF6", icon: "graduation-cap" },
    { name: "Health", type: "expense", color: "#EC4899", icon: "heart-pulse" },
    { name: "Entertainment", type: "expense", color: "#10B981", icon: "clapperboard" },
    { name: "Shopping", type: "expense", color: "#6366F1", icon: "shopping-bag" },
    { name: "Other Expense", type: "expense", color: "#64748B", icon: "help-circle" },
  ];

  await db.insert(categories).values(
    defaultCats.map((cat) => ({
      userId,
      name: cat.name,
      type: cat.type,
      color: cat.color,
      icon: cat.icon,
    }))
  );
}
