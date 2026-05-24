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

    // 3. Generate 90 days of structured, realistic transactions
    const transactions = [];
    let totalBalance = 0;

    const seedMonthlyPattern = (startDay, endDay) => {
      // Income: Salary on day (startDay - 1)
      const salaryDate = subDays(new Date(), startDay - 1);
      const salaryAmount = getRandomAmount(5000, 5200);
      transactions.push({
        id: crypto.randomUUID(),
        type: "INCOME",
        amount: salaryAmount,
        description: "Monthly Salary Payment",
        date: salaryDate,
        category: "salary",
        status: "COMPLETED",
        userId: user.id,
        accountId: account.id,
        createdAt: salaryDate,
        updatedAt: salaryDate,
      });
      totalBalance += salaryAmount;

      // Freelance / dividend income
      const freelanceDate = subDays(new Date(), startDay - 15);
      const freelanceAmount = getRandomAmount(400, 600);
      transactions.push({
        id: crypto.randomUUID(),
        type: "INCOME",
        amount: freelanceAmount,
        description: "Freelance Software Consulting",
        date: freelanceDate,
        category: "freelance",
        status: "COMPLETED",
        userId: user.id,
        accountId: account.id,
        createdAt: freelanceDate,
        updatedAt: freelanceDate,
      });
      totalBalance += freelanceAmount;

      // Expenses: Rent on day (startDay - 2)
      const rentDate = subDays(new Date(), startDay - 2);
      const rentAmount = 1500;
      transactions.push({
        id: crypto.randomUUID(),
        type: "EXPENSE",
        amount: rentAmount,
        description: "Apartment Rental Payment",
        date: rentDate,
        category: "housing",
        status: "COMPLETED",
        userId: user.id,
        accountId: account.id,
        createdAt: rentDate,
        updatedAt: rentDate,
      });
      totalBalance -= rentAmount;

      // Utilities on day (startDay - 5)
      const utilitiesDate = subDays(new Date(), startDay - 5);
      const utilitiesAmount = getRandomAmount(160, 220);
      transactions.push({
        id: crypto.randomUUID(),
        type: "EXPENSE",
        amount: utilitiesAmount,
        description: "Electric & Water Utilities",
        date: utilitiesDate,
        category: "utilities",
        status: "COMPLETED",
        userId: user.id,
        accountId: account.id,
        createdAt: utilitiesDate,
        updatedAt: utilitiesDate,
      });
      totalBalance -= utilitiesAmount;

      // Groceries: 4 times throughout the 30-day block
      for (let g = 0; g < 4; g++) {
        const offset = Math.floor(g * 7.5) + 3;
        const targetDay = startDay - offset;
        if (targetDay < endDay) continue;
        const grocDate = subDays(new Date(), targetDay);
        const grocAmount = getRandomAmount(80, 130);
        transactions.push({
          id: crypto.randomUUID(),
          type: "EXPENSE",
          amount: grocAmount,
          description: "Supermarket Groceries Purchase",
          date: grocDate,
          category: "groceries",
          status: "COMPLETED",
          userId: user.id,
          accountId: account.id,
          createdAt: grocDate,
          updatedAt: grocDate,
        });
        totalBalance -= grocAmount;
      }

      // Transportation: 6 times
      for (let t = 0; t < 6; t++) {
        const offset = Math.floor(t * 5) + 4;
        const targetDay = startDay - offset;
        if (targetDay < endDay) continue;
        const transDate = subDays(new Date(), targetDay);
        const transAmount = getRandomAmount(20, 50);
        transactions.push({
          id: crypto.randomUUID(),
          type: "EXPENSE",
          amount: transAmount,
          description: "Uber Rides & Public Transit",
          date: transDate,
          category: "transportation",
          status: "COMPLETED",
          userId: user.id,
          accountId: account.id,
          createdAt: transDate,
          updatedAt: transDate,
        });
        totalBalance -= transAmount;
      }

      // Food / Restaurants: 5 times
      for (let f = 0; f < 5; f++) {
        const offset = Math.floor(f * 6) + 2;
        const targetDay = startDay - offset;
        if (targetDay < endDay) continue;
        const foodDate = subDays(new Date(), targetDay);
        const foodAmount = getRandomAmount(35, 80);
        transactions.push({
          id: crypto.randomUUID(),
          type: "EXPENSE",
          amount: foodAmount,
          description: "Dinner Out & Cafes",
          date: foodDate,
          category: "food",
          status: "COMPLETED",
          userId: user.id,
          accountId: account.id,
          createdAt: foodDate,
          updatedAt: foodDate,
        });
        totalBalance -= foodAmount;
      }

      // Shopping: 2 times
      for (let s = 0; s < 2; s++) {
        const offset = Math.floor(s * 15) + 6;
        const targetDay = startDay - offset;
        if (targetDay < endDay) continue;
        const shopDate = subDays(new Date(), targetDay);
        const shopAmount = getRandomAmount(60, 160);
        transactions.push({
          id: crypto.randomUUID(),
          type: "EXPENSE",
          amount: shopAmount,
          description: "Online Shopping Retail",
          date: shopDate,
          category: "shopping",
          status: "COMPLETED",
          userId: user.id,
          accountId: account.id,
          createdAt: shopDate,
          updatedAt: shopDate,
        });
        totalBalance -= shopAmount;
      }

      // Travel/Leisure: 1 time
      const travelOffset = 18;
      const travelDay = startDay - travelOffset;
      if (travelDay >= endDay) {
        const travelDate = subDays(new Date(), travelDay);
        const travelAmount = getRandomAmount(350, 600);
        transactions.push({
          id: crypto.randomUUID(),
          type: "EXPENSE",
          amount: travelAmount,
          description: "Weekend Trip Booking",
          date: travelDate,
          category: "travel",
          status: "COMPLETED",
          userId: user.id,
          accountId: account.id,
          createdAt: travelDate,
          updatedAt: travelDate,
        });
        totalBalance -= travelAmount;
      }
    };

    // Run the structured seeding pattern for the last 3 months
    seedMonthlyPattern(90, 60);
    seedMonthlyPattern(60, 30);
    seedMonthlyPattern(30, 0);

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