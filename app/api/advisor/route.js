export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const tools = [
  {
    functionDeclarations: [
      {
        name: "getUserAccountOverview",
        description: "Get an overview of all bank accounts/credit cards and their balances for the logged-in user.",
      },
      {
        name: "getUserRecentTransactions",
        description: "Get recent transaction logs for the logged-in user with optional filters.",
        parameters: {
          type: "OBJECT",
          properties: {
            limit: { type: "INTEGER", description: "Max number of transactions to return (default 10, max 50)." },
            category: { type: "STRING", description: "Filter by category (e.g. food, groceries, travel, shopping, etc.)." },
            startDate: { type: "STRING", description: "Start date in YYYY-MM-DD format." },
            endDate: { type: "STRING", description: "End date in YYYY-MM-DD format." },
          },
        },
      },
      {
        name: "getUserBudgetsAndSpending",
        description: "Get the monthly budget limit and total spent so far in the current month for the logged-in user.",
      },
      {
        name: "getGroupSettlementReport",
        description: "Get the balances and suggested debt settlements for a shared expense group if the user is a member.",
        parameters: {
          type: "OBJECT",
          properties: {
            groupId: { type: "STRING", description: "The UUID of the group." },
          },
          required: ["groupId"],
        },
      },
    ],
  },
];

async function handleGetUserAccountOverview(userId) {
  const accounts = await db.account.findMany({
    where: { userId },
    select: { name: true, type: true, balance: true },
  });
  return accounts.map(acc => ({
    name: acc.name,
    type: acc.type,
    balance: acc.balance.toNumber(),
  }));
}

async function handleGetUserRecentTransactions(userId, args) {
  const { limit = 10, category, startDate, endDate } = args;
  const where = { userId };
  
  if (category) {
    where.category = category.toLowerCase();
  }
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate);
  }

  const transactions = await db.transaction.findMany({
    where,
    orderBy: { date: "desc" },
    take: Math.min(limit, 50),
    select: { date: true, description: true, category: true, type: true, amount: true },
  });

  return transactions.map(t => ({
    date: t.date.toISOString().split("T")[0],
    description: t.description,
    category: t.category,
    type: t.type,
    amount: t.amount.toNumber(),
  }));
}

async function handleGetUserBudgetsAndSpending(userId) {
  const budget = await db.budget.findUnique({
    where: { userId },
  });

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0, 23, 59, 59, 999);

  const expenses = await db.transaction.aggregate({
    where: {
      userId,
      type: "EXPENSE",
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    _sum: {
      amount: true,
    },
  });

  return {
    budgetLimit: budget ? budget.amount.toNumber() : 0,
    currentMonthExpenses: expenses._sum.amount ? expenses._sum.amount.toNumber() : 0,
    monthName: startOfMonth.toLocaleString("default", { month: "long" }),
  };
}

async function handleGetGroupSettlementReport(userId, groupId) {
  const membership = await db.groupMember.findFirst({
    where: { groupId, userId },
  });

  if (!membership) {
    return { error: "You are not a member of this group" };
  }

  const group = await db.group.findUnique({
    where: { id: groupId },
    select: { name: true },
  });

  const expenses = await db.groupExpense.findMany({
    where: { groupId },
    include: {
      paidBy: { select: { id: true, name: true, email: true } },
      paidByAnonymous: { select: { id: true, name: true, email: true } },
      shares: {
        include: {
          user: { select: { id: true, name: true, email: true } },
          anonymousMember: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  const balances = {};
  const userMap = {};

  expenses.forEach((expense) => {
    const payer = expense.paidBy || expense.paidByAnonymous;
    if (payer) {
      if (!userMap[payer.id]) {
        userMap[payer.id] = payer;
        balances[payer.id] = 0;
      }
      balances[payer.id] += expense.amount.toNumber();
    }

    expense.shares.forEach((share) => {
      const participant = share.user || share.anonymousMember;
      if (participant) {
        if (!userMap[participant.id]) {
          userMap[participant.id] = participant;
          balances[participant.id] = 0;
        }
        balances[participant.id] -= share.amount.toNumber();
      }
    });
  });

  const balancesList = Object.entries(balances).map(([id, bal]) => ({
    name: userMap[id].name || userMap[id].email,
    netBalance: Number(bal.toFixed(2)),
  }));

  const settlements = [];
  const debtors = balancesList.filter((b) => b.netBalance < 0).sort((a, b) => a.netBalance - b.netBalance);
  const creditors = balancesList.filter((b) => b.netBalance > 0).sort((a, b) => b.netBalance - a.netBalance);

  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(Math.abs(debtor.netBalance), creditor.netBalance);

    if (amount > 0.01) {
      settlements.push({
        from: debtor.name,
        to: creditor.name,
        amount: Number(amount.toFixed(2)),
      });
    }

    debtor.netBalance += amount;
    creditor.netBalance -= amount;

    if (Math.abs(debtor.netBalance) < 0.01) i++;
    if (Math.abs(creditor.netBalance) < 0.01) j++;
  }

  return {
    groupName: group?.name || "Group",
    balances: balancesList,
    suggestedSettlements: settlements,
  };
}

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const limitResult = await rateLimit(ip, "ai-advisor", 15, 60000);
    if (!limitResult.success) {
      return Response.json({ error: "Rate limit exceeded. Please wait a minute." }, { status: 429 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: "Invalid messages format" }, { status: 400 });
    }

    const history = messages.slice(0, -1).map(msg => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));
    const latestMessage = messages[messages.length - 1].content;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: `You are Welth AI, an expert, professional, and friendly financial advisor bot built for the Welth application. 
      You help users understand their personal budgets, transaction categories, accounts, and group settlements.
      Always respond in natural, friendly language. You may use markdown (bullet points, bold text) to keep your advice clean and structured.
      You have access to safe tools to query the user's accounts, budgets, recent transactions, and group reports.
      NEVER reveal database IDs to the user. Always use names or descriptions.
      If the user asks a question that requires data from their accounts or transactions, use the appropriate tools.
      If a tool returns no data, explain that politely. 
      Only query user data using the tools provided. Your tool queries are completely sandboxed to the logged-in user.`,
    });

    const chat = model.startChat({
      history,
      tools,
    });

    let response = await chat.sendMessage(latestMessage);
    let functionCalls = response.response.functionCalls;

    while (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      let toolResult = null;

      if (call.name === "getUserAccountOverview") {
        toolResult = await handleGetUserAccountOverview(user.id);
      } else if (call.name === "getUserRecentTransactions") {
        toolResult = await handleGetUserRecentTransactions(user.id, call.args);
      } else if (call.name === "getUserBudgetsAndSpending") {
        toolResult = await handleGetUserBudgetsAndSpending(user.id);
      } else if (call.name === "getGroupSettlementReport") {
        toolResult = await handleGetGroupSettlementReport(user.id, call.args.groupId);
      }

      const result = await chat.sendMessage([
        {
          functionResponse: {
            name: call.name,
            response: { result: toolResult },
          },
        },
      ]);
      
      response = result;
      functionCalls = response.response.functionCalls;
    }

    const text = response.response.text();
    return Response.json({ role: "assistant", content: text });
  } catch (error) {
    console.error("AI Advisor error:", error);
    return Response.json({ error: error.message || "Failed to process chat" }, { status: 500 });
  }
}
