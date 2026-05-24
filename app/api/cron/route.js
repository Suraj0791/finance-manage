import { db } from "@/lib/prisma";
import { sendEmail } from "@/actions/send-email";
import EmailTemplate from "@/emails/template";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Force Node.js runtime for Prisma and dynamic execution compatibility
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  // Verify secure CRON_SECRET if configured in .env
  const authHeader = req.headers.get("authorization");
  const urlSecret = searchParams.get("secret");
  const expectedSecret = process.env.CRON_SECRET;

  if (expectedSecret) {
    const token = authHeader ? authHeader.replace("Bearer ", "") : urlSecret;
    if (token !== expectedSecret) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    switch (action) {
      case "recurring": {
        const recurringCount = await handleRecurringTransactions();
        return Response.json({
          success: true,
          message: `Successfully processed ${recurringCount} recurring transactions.`,
        });
      }
      case "reports": {
        const reportsCount = await handleMonthlyReports();
        return Response.json({
          success: true,
          message: `Successfully generated and emailed ${reportsCount} monthly reports.`,
        });
      }
      case "budgets": {
        const budgetsCount = await handleBudgetAlerts();
        return Response.json({
          success: true,
          message: `Successfully completed budget checks and sent ${budgetsCount} alerts.`,
        });
      }
      default: {
        // Run recurring transactions and budget alerts by default
        const recurring = await handleRecurringTransactions();
        const budgets = await handleBudgetAlerts();
        return Response.json({
          success: true,
          processed: {
            recurringTransactions: recurring,
            budgetAlerts: budgets,
          },
        });
      }
    }
  } catch (error) {
    console.error("Cron route execution failed:", error);
    return Response.json(
      {
        success: false,
        error: error.message || "Internal Cron Handler Error",
      },
      { status: 500 }
    );
  }
}

// ==========================================
// CRON HANDLER FUNCTIONS
// ==========================================

async function handleRecurringTransactions() {
  const recurringTransactions = await db.transaction.findMany({
    where: {
      isRecurring: true,
      status: "COMPLETED",
      OR: [
        { lastProcessed: null },
        {
          nextRecurringDate: {
            lte: new Date(),
          },
        },
      ],
    },
    include: {
      account: true,
    },
  });

  for (const transaction of recurringTransactions) {
    // Process single transaction and update balance atomically
    await db.$transaction(async (tx) => {
      // Create new transaction duplicate
      await tx.transaction.create({
        data: {
          type: transaction.type,
          amount: transaction.amount,
          description: `${transaction.description} (Recurring)`,
          date: new Date(),
          category: transaction.category,
          userId: transaction.userId,
          accountId: transaction.accountId,
          isRecurring: false,
        },
      });

      // Update account balance
      const balanceChange =
        transaction.type === "EXPENSE"
          ? -transaction.amount.toNumber()
          : transaction.amount.toNumber();

      await tx.account.update({
        where: { id: transaction.accountId },
        data: { balance: { increment: balanceChange } },
      });

      // Calculate and update next processing date
      await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          lastProcessed: new Date(),
          nextRecurringDate: calculateNextRecurringDate(
            new Date(),
            transaction.recurringInterval
          ),
        },
      });
    });
  }

  return recurringTransactions.length;
}

async function handleMonthlyReports() {
  const users = await db.user.findMany({
    include: { accounts: true },
  });

  for (const user of users) {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const stats = await getMonthlyStats(user.id, lastMonth);
    const monthName = lastMonth.toLocaleString("default", {
      month: "long",
    });

    // Generate AI insights via Google Gemini API
    const insights = await generateFinancialInsights(stats, monthName);

    await sendEmail({
      to: user.email,
      subject: `Your Monthly Financial Report - ${monthName}`,
      react: EmailTemplate({
        userName: user.name,
        type: "monthly-report",
        data: {
          stats,
          month: monthName,
          insights,
        },
      }),
    });
  }

  return users.length;
}

async function handleBudgetAlerts() {
  const budgets = await db.budget.findMany({
    include: {
      user: {
        include: {
          accounts: {
            where: {
              isDefault: true,
            },
          },
        },
      },
    },
  });

  let alertsSent = 0;

  for (const budget of budgets) {
    const defaultAccount = budget.user.accounts[0];
    if (!defaultAccount) continue; // Skip if no default account

    const startDate = new Date();
    startDate.setDate(1); // Start of current month

    // Calculate total expenses for the default account only
    const expenses = await db.transaction.aggregate({
      where: {
        userId: budget.userId,
        accountId: defaultAccount.id,
        type: "EXPENSE",
        date: {
          gte: startDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const totalExpenses = expenses._sum.amount?.toNumber() || 0;
    const budgetAmount = budget.amount.toNumber();
    const percentageUsed = (totalExpenses / budgetAmount) * 100;

    // Check if utilization exceeds 80% threshold and no alert sent this month
    if (
      percentageUsed >= 80 &&
      (!budget.lastAlertSent ||
        isNewMonth(new Date(budget.lastAlertSent), new Date()))
    ) {
      await sendEmail({
        to: budget.user.email,
        subject: `Budget Alert for ${defaultAccount.name}`,
        react: EmailTemplate({
          userName: budget.user.name,
          type: "budget-alert",
          data: {
            percentageUsed,
            budgetAmount: budgetAmount.toFixed(1),
            totalExpenses: totalExpenses.toFixed(1),
            accountName: defaultAccount.name,
          },
        }),
      });

      // Update last alert sent timestamp
      await db.budget.update({
        where: { id: budget.id },
        data: { lastAlertSent: new Date() },
      });

      alertsSent++;
    }
  }

  return alertsSent;
}

// ==========================================
// UTILITY HELPERS
// ==========================================

function calculateNextRecurringDate(date, interval) {
  const next = new Date(date);
  switch (interval) {
    case "DAILY":
      next.setDate(next.getDate() + 1);
      break;
    case "WEEKLY":
      next.setDate(next.getDate() + 7);
      break;
    case "MONTHLY":
      next.setMonth(next.getMonth() + 1);
      break;
    case "YEARLY":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  return next;
}

function isNewMonth(lastAlertDate, currentDate) {
  return (
    lastAlertDate.getMonth() !== currentDate.getMonth() ||
    lastAlertDate.getFullYear() !== currentDate.getFullYear()
  );
}

async function getMonthlyStats(userId, month) {
  const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
  const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  const transactions = await db.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  return transactions.reduce(
    (stats, t) => {
      const amount = t.amount.toNumber();
      if (t.type === "EXPENSE") {
        stats.totalExpenses += amount;
        stats.byCategory[t.category] =
          (stats.byCategory[t.category] || 0) + amount;
      } else {
        stats.totalIncome += amount;
      }
      return stats;
    },
    {
      totalExpenses: 0,
      totalIncome: 0,
      byCategory: {},
      transactionCount: transactions.length,
    }
  );
}

async function generateFinancialInsights(stats, month) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Analyze this financial data and provide 3 concise, actionable insights.
    Focus on spending patterns and practical advice.
    Keep it friendly and conversational.

    Financial Data for ${month}:
    - Total Income: $${stats.totalIncome}
    - Total Expenses: $${stats.totalExpenses}
    - Net Income: $${stats.totalIncome - stats.totalExpenses}
    - Expense Categories: ${Object.entries(stats.byCategory)
      .map(([category, amount]) => `${category}: $${amount}`)
      .join(", ")}

    Format the response as a JSON array of strings, like this:
    ["insight 1", "insight 2", "insight 3"]
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error generating insights:", error);
    return [
      "Your highest expense category this month might need attention.",
      "Consider setting up a budget for better financial management.",
      "Track your recurring expenses to identify potential savings.",
    ];
  }
}
