"use server";

import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { subDays } from "date-fns";
import crypto from "crypto";

// Categories with typical amount ranges
const CATEGORIES = {
  INCOME: [
    { name: "salary", range: [5000, 8000] },
    { name: "freelance", range: [1000, 3000] },
    { name: "investments", range: [500, 2000] },
    { name: "other-income", range: [100, 1000] },
  ],
  EXPENSE: [
    { name: "housing", range: [1000, 2000] },
    { name: "transportation", range: [100, 500] },
    { name: "groceries", range: [200, 600] },
    { name: "utilities", range: [100, 300] },
    { name: "entertainment", range: [50, 200] },
    { name: "food", range: [50, 150] },
    { name: "shopping", range: [100, 500] },
    { name: "healthcare", range: [100, 1000] },
    { name: "education", range: [200, 1000] },
    { name: "travel", range: [500, 2000] },
  ],
};

function getRandomAmount(min, max) {
  return Number((Math.random() * (max - min) + min).toFixed(2));
}

function getRandomCategory(type) {
  const categories = CATEGORIES[type];
  const category = categories[Math.floor(Math.random() * categories.length)];
  const amount = getRandomAmount(category.range[0], category.range[1]);
  return { category: category.name, amount };
}

export async function seedTransactions() {
  try {
    // 1. Authenticate the active user session
    const session = await auth();
    if (!session?.user?.email) {
      return {
        success: false,
        error: "Authentication required. Please sign in first.",
      };
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return {
        success: false,
        error: "User account not synced in database yet.",
      };
    }

    // 2. Find or create default account
    let account = await db.account.findFirst({
      where: { userId: user.id, isDefault: true },
    });

    if (!account) {
      account = await db.account.create({
        data: {
          name: "Main Checking",
          type: "CURRENT",
          balance: 0,
          isDefault: true,
          userId: user.id,
        },
      });
    }

    // 3. Generate 90 days of transactions for this account
    const transactions = [];
    let totalBalance = 0;

    for (let i = 90; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const transactionsPerDay = Math.floor(Math.random() * 2) + 1; // 1 to 2 transactions per day

      for (let j = 0; j < transactionsPerDay; j++) {
        const type = Math.random() < 0.3 ? "INCOME" : "EXPENSE"; // 30% income, 70% expenses
        const { category, amount } = getRandomCategory(type);

        transactions.push({
          id: crypto.randomUUID(),
          type,
          amount,
          description: `${type === "INCOME" ? "Received" : "Paid for"} ${category}`,
          date,
          category,
          status: "COMPLETED",
          userId: user.id,
          accountId: account.id,
          createdAt: date,
          updatedAt: date,
        });

        totalBalance += type === "INCOME" ? amount : -amount;
      }
    }

    // 4. Create or update budget
    await db.budget.upsert({
      where: { userId: user.id },
      update: { amount: 4000 },
      create: { userId: user.id, amount: 4000 },
    });

    // 5. Create default Splitwise group for demo splits
    let group = await db.group.findFirst({
      where: { createdById: user.id, name: "Friends (Demo)" },
    });

    if (!group) {
      group = await db.group.create({
        data: {
          name: "Friends (Demo)",
          description: "Demo group to test bill splits and debt simplification.",
          createdById: user.id,
          members: {
            create: {
              userId: user.id,
              role: "ADMIN",
            },
          },
          anonymousMembers: {
            create: [
              { name: "Alice", email: "alice@example.com" },
              { name: "Bob", email: "bob@example.com" },
            ],
          },
        },
        include: {
          anonymousMembers: true,
        },
      });

      const alice = group.anonymousMembers.find((m) => m.name === "Alice");
      const bob = group.anonymousMembers.find((m) => m.name === "Bob");

      // Expense 1: Rent ($1200) paid by user, split equally
      const expense1 = await db.groupExpense.create({
        data: {
          groupId: group.id,
          paidByUserId: user.id,
          title: "Apartment Rent",
          amount: 1200,
          category: "housing",
          date: new Date(),
          splitType: "EQUAL",
        },
      });
      await db.expenseShare.createMany({
        data: [
          { expenseId: expense1.id, userId: user.id, amount: 400, isPaid: true },
          { expenseId: expense1.id, anonymousMemberId: alice.id, amount: 400, isPaid: false },
          { expenseId: expense1.id, anonymousMemberId: bob.id, amount: 400, isPaid: false },
        ],
      });

      // Expense 2: Groceries ($150) paid by Alice, split equally
      const expense2 = await db.groupExpense.create({
        data: {
          groupId: group.id,
          paidByAnonymousMemberId: alice.id,
          title: "Groceries",
          amount: 150,
          category: "food",
          date: new Date(),
          splitType: "EQUAL",
        },
      });
      await db.expenseShare.createMany({
        data: [
          { expenseId: expense2.id, userId: user.id, amount: 50, isPaid: false },
          { expenseId: expense2.id, anonymousMemberId: alice.id, amount: 50, isPaid: true },
          { expenseId: expense2.id, anonymousMemberId: bob.id, amount: 50, isPaid: false },
        ],
      });
    }

    // 6. Perform batch db operations in transaction
    await db.$transaction(async (tx) => {
      // Clear previous seed data for this account
      await tx.transaction.deleteMany({
        where: { accountId: account.id },
      });

      // Insert new transactions
      await tx.transaction.createMany({
        data: transactions,
      });

      // Update account balance
      await tx.account.update({
        where: { id: account.id },
        data: { balance: totalBalance },
      });
    });

    return {
      success: true,
      message: `Database populated: Created checking account, $4,000 monthly budget, "Friends (Demo)" Splitwise group, and ${transactions.length} mock transactions successfully.`,
    };
  } catch (error) {
    console.error("Error seeding transactions:", error);
    return { success: false, error: error.message };
  }
}