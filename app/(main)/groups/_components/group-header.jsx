"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Settings, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { InviteUserDialog } from "./invite-user-dialog";

export function GroupHeader({ group }) {
  const { name, description, imageUrl, members, createdBy } = group;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <Link
            href="/groups"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Groups
          </Link>
          <div className="flex items-center gap-2">
            <InviteUserDialog groupId={group.id} />
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={imageUrl} alt={name} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl">
              {name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold">{name}</h1>
              <Badge variant="secondary">Active</Badge>
            </div>
            {description && (
              <p className="text-muted-foreground mb-4">{description}</p>
            )}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {members.slice(0, 5).map((member) => (
                  <Avatar
                    key={member.id}
                    className="h-8 w-8 border-2 border-white"
                  >
                    <AvatarImage
                      src={member.user.imageUrl}
                      alt={member.user.name}
                    />
                    <AvatarFallback className="text-xs">
                      {member.user.name?.charAt(0) ||
                        member.user.email?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {members.length > 5 && (
                  <div className="h-8 w-8 rounded-full bg-muted border-2 border-white flex items-center justify-center">
                    <span className="text-xs font-medium">
                      +{members.length - 5}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-sm text-muted-foreground">
                {members.length} member{members.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
