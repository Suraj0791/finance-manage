"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import crypto from "crypto";

const serializeDecimal = (obj) => {
  const serialized = { ...obj };
  if (obj.amount) {
    serialized.amount = obj.amount.toNumber();
  }
  return serialized;
};

// Create a new group
export async function createGroup(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const group = await db.group.create({
      data: {
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
        createdById: user.id,
        members: {
          create: {
            userId: user.id,
            role: "ADMIN",
          },
        },
        // Create anonymous members if provided
        ...(data.members &&
          data.members.length > 0 && {
            anonymousMembers: {
              create: data.members.map((member) => ({
                name: member.name,
                email: member.email || null,
              })),
            },
          }),
      },
      include: {
        members: {
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
        anonymousMembers: true,
        _count: {
          select: {
            members: true,
            expenses: true,
          },
        },
      },
    });

    // Revalidate paths and cache
    revalidatePath("/groups");
    revalidateTag("groups");

    return { success: true, data: group };
  } catch (error) {
    throw new Error(error.message);
  }
}

// Get user's groups
export async function getUserGroups() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const groups = await db.group.findMany({
      where: {
        members: {
          some: {
            userId: user.id,
          },
        },
        isActive: true,
      },
      include: {
        members: {
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
        _count: {
          select: {
            members: true,
            expenses: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return groups;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Get group details
export async function getGroupDetails(groupId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Check if user is member of the group
    const membership = await db.groupMember.findFirst({
      where: {
        groupId,
        userId: user.id,
      },
    });

    if (!membership) {
      throw new Error("You are not a member of this group");
    }

    const group = await db.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
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
        anonymousMembers: {
          where: {
            isActive: true,
          },
        },
        expenses: {
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
                  },
                },
              },
            },
          },
          orderBy: {
            date: "desc",
          },
        },
      },
    });

    if (!group) {
      throw new Error("Group not found");
    }

    // Serialize decimal fields
    const serializedGroup = {
      ...group,
      expenses: group.expenses.map((expense) => ({
        ...serializeDecimal(expense),
        shares: expense.shares.map(serializeDecimal),
      })),
    };

    return serializedGroup;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Invite user to group
export async function inviteUserToGroup(groupId, email) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Check if user is admin of the group
    const membership = await db.groupMember.findFirst({
      where: {
        groupId,
        userId: user.id,
        role: "ADMIN",
      },
    });

    if (!membership) {
      throw new Error(
        "You don't have permission to invite users to this group"
      );
    }

    // Check if user is already invited or member
    const existingInvitation = await db.groupInvitation.findFirst({
      where: {
        groupId,
        email,
        status: "PENDING",
      },
    });

    if (existingInvitation) {
      throw new Error("User is already invited to this group");
    }

    // Check if user is already a member
    const invitedUser = await db.user.findUnique({
      where: { email },
    });

    if (invitedUser) {
      const existingMember = await db.groupMember.findFirst({
        where: {
          groupId,
          userId: invitedUser.id,
        },
      });

      if (existingMember) {
        throw new Error("User is already a member of this group");
      }
    }

    // Create invitation
    const invitation = await db.groupInvitation.create({
      data: {
        groupId,
        senderUserId: user.id,
        receiverUserId: invitedUser?.id,
        email,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
      include: {
        group: {
          select: {
            name: true,
          },
        },
        sender: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // TODO: Send email invitation using Resend
    // await sendInvitationEmail(invitation);

    revalidatePath(`/groups/${groupId}`);
    return { success: true, data: invitation };
  } catch (error) {
    throw new Error(error.message);
  }
}

// Accept group invitation
export async function acceptGroupInvitation(invitationId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const invitation = await db.groupInvitation.findUnique({
      where: { id: invitationId },
      include: {
        group: true,
      },
    });

    if (!invitation) {
      throw new Error("Invitation not found");
    }

    if (invitation.email !== user.email) {
      throw new Error("This invitation is not for you");
    }

    if (invitation.status !== "PENDING") {
      throw new Error("Invitation is no longer valid");
    }

    if (invitation.expiresAt < new Date()) {
      throw new Error("Invitation has expired");
    }

    // Add user to group and update invitation status
    await db.$transaction([
      db.groupMember.create({
        data: {
          groupId: invitation.groupId,
          userId: user.id,
          role: "MEMBER",
        },
      }),
      db.groupInvitation.update({
        where: { id: invitationId },
        data: { status: "ACCEPTED" },
      }),
    ]);

    revalidatePath("/groups");
    revalidatePath(`/groups/${invitation.groupId}`);
    return { success: true };
  } catch (error) {
    throw new Error(error.message);
  }
}

// Get user's pending invitations
export async function getUserInvitations() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const invitations = await db.groupInvitation.findMany({
      where: {
        email: user.email,
        status: "PENDING",
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            description: true,
            imageUrl: true,
          },
        },
        sender: {
          select: {
            name: true,
            email: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return invitations;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Calculate group balances and settlements
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

    // Check if user is member of the group
    const membership = await db.groupMember.findFirst({
      where: {
        groupId,
        userId: user.id,
      },
    });

    if (!membership) {
      throw new Error("You are not a member of this group");
    }

    // Get all expenses and their shares for this group
    const expenses = await db.groupExpense.findMany({
      where: { groupId },
      include: {
        paidBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        shares: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Calculate balances for each user
    const balances = {};
    const userMap = {};

    // Initialize balances and user map
    expenses.forEach((expense) => {
      // Add payer to userMap
      if (!userMap[expense.paidBy.id]) {
        userMap[expense.paidBy.id] = expense.paidBy;
        balances[expense.paidBy.id] = 0;
      }

      // Add all participants to userMap
      expense.shares.forEach((share) => {
        if (!userMap[share.user.id]) {
          userMap[share.user.id] = share.user;
          balances[share.user.id] = 0;
        }
      });
    });

    // Calculate what each person paid vs what they owe
    expenses.forEach((expense) => {
      const totalAmount = expense.amount.toNumber();
      const paidById = expense.paidBy.id;

      // Person who paid gets credited
      balances[paidById] += totalAmount;

      // Each person who has a share gets debited
      expense.shares.forEach((share) => {
        const shareAmount = share.amount.toNumber();
        balances[share.user.id] -= shareAmount;
      });
    });

    // Convert to array format with user details
    const balancesList = Object.entries(balances).map(([userId, balance]) => ({
      user: userMap[userId],
      balance: Number(balance.toFixed(2)),
      netBalance: Number(balance.toFixed(2)),
      owes: balance < 0 ? Math.abs(balance) : 0,
      owed: balance > 0 ? balance : 0,
    }));

    // Calculate suggested settlements (simplified)
    const settlements = [];
    const debtors = balancesList
      .filter((b) => b.balance < 0)
      .sort((a, b) => a.balance - b.balance);
    const creditors = balancesList
      .filter((b) => b.balance > 0)
      .sort((a, b) => b.balance - a.balance);

    let i = 0,
      j = 0;
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const amount = Math.min(Math.abs(debtor.balance), creditor.balance);

      if (amount > 0.01) {
        // Avoid tiny settlements
        settlements.push({
          from: debtor.user,
          to: creditor.user,
          amount: Number(amount.toFixed(2)),
        });
      }

      debtor.balance += amount;
      creditor.balance -= amount;

      if (Math.abs(debtor.balance) < 0.01) i++;
      if (Math.abs(creditor.balance) < 0.01) j++;
    }

    return {
      balances: balancesList,
      settlements,
      totalExpenses: expenses.reduce(
        (sum, exp) => sum + exp.amount.toNumber(),
        0
      ),
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

// Generate invite link for group
export async function generateGroupInviteLink(groupId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Check if user is admin of the group
    const membership = await db.groupMember.findFirst({
      where: {
        groupId,
        userId: user.id,
        role: "ADMIN",
      },
    });

    if (!membership) {
      throw new Error(
        "You don't have permission to generate invite links for this group"
      );
    }

    // Generate a secure token
    const token = crypto.randomBytes(32).toString("hex");

    // Delete any existing invite link tokens for this group (cleanup)
    await db.groupInvitation.deleteMany({
      where: {
        groupId,
        email: {
          startsWith: "invite_link_",
        },
        status: "PENDING",
      },
    });

    // Create new invite token
    const inviteToken = await db.groupInvitation.create({
      data: {
        groupId,
        senderUserId: user.id,
        email: `invite_link_${token}`,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        status: "PENDING",
      },
    });

    const inviteUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/invite/${groupId}/${token}`;

    return {
      success: true,
      data: { inviteUrl, token, expiresAt: inviteToken.expiresAt },
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

// Join group via invite link
export async function joinGroupViaInviteLink(groupId, token) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Find the invite token
    const invitation = await db.groupInvitation.findFirst({
      where: {
        groupId,
        email: `invite_link_${token}`,
        status: "PENDING",
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        group: true,
      },
    });

    if (!invitation) {
      throw new Error("Invalid or expired invite link");
    }

    // Check if user is already a member
    const existingMember = await db.groupMember.findFirst({
      where: {
        groupId,
        userId: user.id,
      },
    });

    if (existingMember) {
      throw new Error("You are already a member of this group");
    }

    // Add user to group
    await db.groupMember.create({
      data: {
        groupId,
        userId: user.id,
        role: "MEMBER",
      },
    });

    revalidatePath("/groups");
    revalidatePath(`/groups/${groupId}`);
    return { success: true, group: invitation.group };
  } catch (error) {
    throw new Error(error.message);
  }
}
