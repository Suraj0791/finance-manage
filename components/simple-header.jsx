import React from "react";
import Link from "next/link";
import Image from "next/image";
import { auth, signOut } from "@/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "./ui/button";

const SimpleHeader = async () => {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/">
          <Image
            src={"/logo.png"}
            alt="Finance Logo"
            width={200}
            height={60}
            className="h-12 w-auto object-contain"
          />
        </Link>

        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" className="text-blue-600 hover:underline">
                Dashboard
              </Link>
              <Avatar className="w-10 h-10 border">
                <AvatarImage src={session.user.image || ""} />
                <AvatarFallback className="bg-blue-100 text-blue-700 font-bold uppercase">
                  {session.user.name ? session.user.name.substring(0, 2) : "US"}
                </AvatarFallback>
              </Avatar>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <Button variant="outline" type="submit" size="sm">
                  Sign Out
                </Button>
              </form>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm">Sign In</Button>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default SimpleHeader;
