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
    });

    revalidatePath("/groups");
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
      expenses: group.expenses.map(expense => ({
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
      throw new Error("You don't have permission to invite users to this group");
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
