"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, UserPlus } from "lucide-react";
import { joinGroupViaInviteLink } from "@/actions/groups";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import useFetch from "@/hooks/use-fetch";

export function JoinGroupButton({ groupId, token }) {
  const [joined, setJoined] = useState(false);
  const router = useRouter();

  const {
    loading: joinLoading,
    fn: joinGroupFn,
    data: joinResult,
  } = useFetch(joinGroupViaInviteLink);

  const handleJoinGroup = async () => {
    try {
      const result = await joinGroupFn(groupId, token);
      if (result?.success) {
        setJoined(true);
        toast.success(`Successfully joined ${result.group.name}!`);
        setTimeout(() => {
          router.push(`/groups/${groupId}`);
        }, 1500);
      }
    } catch (error) {
      toast.error("Failed to join group. Please try again.");
    }
  };

  if (joined) {
    return (
      <Button disabled className="w-full">
        <CheckCircle className="h-4 w-4 mr-2" />
        Joined! Redirecting...
      </Button>
    );
  }

  return (
    <Button onClick={handleJoinGroup} disabled={joinLoading} className="w-full">
      {joinLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <UserPlus className="h-4 w-4 mr-2" />
      )}
      Join Group
    </Button>
  );
}
