"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const serializeDecimal = (obj) => {
  const serialized = { ...obj };
  if (obj.amount) {
    serialized.amount = obj.amount.toNumber();
  }
  return serialized;
};

// Create group expense
export async function createGroupExpense(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Verify user is member of the group
    const membership = await db.groupMember.findFirst({
      where: {
        groupId: data.groupId,
        userId: user.id,
      },
    });

    if (!membership) {
      throw new Error("You are not a member of this group");
    }

    // Get group members for equal split calculation
    const groupMembers = await db.groupMember.findMany({
      where: { groupId: data.groupId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Calculate shares based on split type
    let shares = [];
    const totalAmount = parseFloat(data.amount);

    if (data.splitType === "EQUAL") {
      const shareAmount = totalAmount / groupMembers.length;
      shares = groupMembers.map((member) => ({
        userId: member.userId,
        amount: shareAmount,
      }));
    } else if (data.splitType === "EXACT" && data.shares) {
      shares = data.shares.map((share) => ({
        userId: share.userId,
        amount: parseFloat(share.amount),
      }));
    } else if (data.splitType === "PERCENTAGE" && data.shares) {
      shares = data.shares.map((share) => ({
        userId: share.userId,
        amount: (totalAmount * parseFloat(share.percentage)) / 100,
      }));
    }

    // Validate shares sum equals total amount
    const sharesSum = shares.reduce((sum, share) => sum + share.amount, 0);
    if (Math.abs(sharesSum - totalAmount) > 0.01) {
      throw new Error("Shares must sum up to the total amount");
    }

    // Create expense and shares in a transaction
    const expense = await db.$transaction(async (tx) => {
      const newExpense = await tx.groupExpense.create({
        data: {
          groupId: data.groupId,
          paidByUserId: user.id,
          title: data.title,
          description: data.description,
          amount: totalAmount,
          category: data.category,
          date: new Date(data.date),
          receiptUrl: data.receiptUrl,
          splitType: data.splitType,
        },
      });

      // Create expense shares
      await tx.expenseShare.createMany({
        data: shares.map((share) => ({
          expenseId: newExpense.id,
          userId: share.userId,
          amount: share.amount,
          isPaid: share.userId === user.id, // Payer's share is automatically paid
        })),
      });

      return newExpense;
    });

    revalidatePath(`/groups/${data.groupId}`);
    return { success: true, data: serializeDecimal(expense) };
  } catch (error) {
    throw new Error(error.message);
  }
}

// Get group expenses
export async function getGroupExpenses(groupId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Verify user is member of the group
    const membership = await db.groupMember.findFirst({
      where: {
        groupId,
        userId: user.id,
      },
    });

    if (!membership) {
      throw new Error("You are not a member of this group");
    }

    const expenses = await db.groupExpense.findMany({
      where: { groupId },
      include: {
        paidBy: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
          },
        },
        shares: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    // Serialize decimal fields
    const serializedExpenses = expenses.map((expense) => ({
      ...serializeDecimal(expense),
      shares: expense.shares.map(serializeDecimal),
    }));

    return serializedExpenses;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Calculate group balances
export async function calculateGroupBalances(groupId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Verify user is member of the group
    const membership = await db.groupMember.findFirst({
      where: {
        groupId,
        userId: user.id,
      },
    });

    if (!membership) {
      throw new Error("You are not a member of this group");
    }

    const expenses = await db.groupExpense.findMany({
      where: { groupId },
      include: {
        paidBy: {
          select: { id: true, name: true, email: true, imageUrl: true },
        },
        shares: {
          include: {
            user: {
              select: { id: true, name: true, email: true, imageUrl: true },
            },
          },
        },
      },
    });

    // Calculate balances
    const balances = {};
    const members = await db.groupMember.findMany({
      where: { groupId },
      include: {
        user: {
          select: { id: true, name: true, email: true, imageUrl: true },
        },
      },
    });

    // Initialize balances
    members.forEach((member) => {
      balances[member.userId] = {
        user: member.user,
        totalPaid: 0,
        totalOwed: 0,
        netBalance: 0,
      };
    });

    // Calculate from expenses
    expenses.forEach((expense) => {
      const paidByUserId = expense.paidByUserId;
      const expenseAmount = expense.amount.toNumber();

      // Add to payer's total paid
      if (balances[paidByUserId]) {
        balances[paidByUserId].totalPaid += expenseAmount;
      }

      // Add to each member's total owed
      expense.shares.forEach((share) => {
        const shareAmount = share.amount.toNumber();
        if (balances[share.userId]) {
          balances[share.userId].totalOwed += shareAmount;
        }
      });
    });

    // Calculate net balances
    Object.keys(balances).forEach((userId) => {
      balances[userId].netBalance =
        balances[userId].totalPaid - balances[userId].totalOwed;
    });

    return Object.values(balances);
  } catch (error) {
    throw new Error(error.message);
  }
}

// Settle up between users
export async function createSettlement(
  fromUserId,
  toUserId,
  amount,
  description = ""
) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.id !== fromUserId) {
      throw new Error("You can only create settlements for yourself");
    }

    const settlement = await db.settlement.create({
      data: {
        fromUserId,
        toUserId,
        amount: parseFloat(amount),
        description,
        status: "PENDING",
      },
      include: {
        fromUser: {
          select: { id: true, name: true, email: true, imageUrl: true },
        },
        toUser: {
          select: { id: true, name: true, email: true, imageUrl: true },
        },
      },
    });

    // TODO: Send notification to the receiving user
    // await sendSettlementNotification(settlement);

    revalidatePath("/settlements");
    return { success: true, data: serializeDecimal(settlement) };
  } catch (error) {
    throw new Error(error.message);
  }
}

// Mark settlement as completed
export async function markSettlementCompleted(settlementId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const settlement = await db.settlement.findUnique({
      where: { id: settlementId },
    });

    if (!settlement) {
      throw new Error("Settlement not found");
    }

    if (settlement.toUserId !== user.id) {
      throw new Error(
        "You can only mark settlements paid that are owed to you"
      );
    }

    const updatedSettlement = await db.settlement.update({
      where: { id: settlementId },
      data: {
        status: "COMPLETED",
        settledAt: new Date(),
      },
      include: {
        fromUser: {
          select: { id: true, name: true, email: true, imageUrl: true },
        },
        toUser: {
          select: { id: true, name: true, email: true, imageUrl: true },
        },
      },
    });

    revalidatePath("/settlements");
    return { success: true, data: serializeDecimal(updatedSettlement) };
  } catch (error) {
    throw new Error(error.message);
  }
}

// Get user's settlements
export async function getUserSettlements() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const settlements = await db.settlement.findMany({
      where: {
        OR: [{ fromUserId: user.id }, { toUserId: user.id }],
      },
      include: {
        fromUser: {
          select: { id: true, name: true, email: true, imageUrl: true },
        },
        toUser: {
          select: { id: true, name: true, email: true, imageUrl: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return settlements.map(serializeDecimal);
  } catch (error) {
    throw new Error(error.message);
  }
}
