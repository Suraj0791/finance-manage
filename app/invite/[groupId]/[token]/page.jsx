import { joinGroupViaInviteLink } from "@/actions/groups";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { JoinGroupButton } from "./_components/join-group-button";

export default async function InvitePage({ params }) {
  const { groupId, token } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect(`/sign-in?redirect_url=/invite/${groupId}/${token}`);
  }

  // Get group information first
  let groupInfo = null;
  let error = null;

  try {
    // We need to get basic group info without joining yet
    const { db } = await import("@/lib/prisma");

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
        group: {
          select: {
            id: true,
            name: true,
            description: true,
            imageUrl: true,
            _count: {
              select: {
                members: true,
              },
            },
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
    });

    if (!invitation) {
      error = "This invite link is invalid or has expired.";
    } else {
      groupInfo = invitation.group;

      // Check if user is already a member
      const user = await db.user.findUnique({
        where: { clerkUserId: userId },
      });

      if (user) {
        const existingMember = await db.groupMember.findFirst({
          where: {
            groupId,
            userId: user.id,
          },
        });

        if (existingMember) {
          redirect(`/groups/${groupId}`);
        }
      }
    }
  } catch (err) {
    error = "Something went wrong. Please try again.";
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600 flex items-center justify-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Invalid Invite
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <Link href="/groups">
              <Button className="w-full">Go to Groups</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-green-600 flex items-center justify-center gap-2">
            <Users className="h-5 w-5" />
            Join Group
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Group Info */}
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold">{groupInfo.name}</h2>
            {groupInfo.description && (
              <p className="text-muted-foreground">{groupInfo.description}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {groupInfo._count.members} members
            </p>
          </div>

          {/* Join Button */}
          <JoinGroupButton groupId={groupId} token={token} />

          {/* Alternative */}
          <div className="text-center">
            <Link
              href="/groups"
              className="text-sm text-muted-foreground hover:underline"
            >
              Go to your groups instead
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
