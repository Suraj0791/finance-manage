import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { db } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      try {
        // Sync user with our database
        const existingUser = await db.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          await db.user.create({
            data: {
              email: user.email,
              name: user.name || "User",
              imageUrl: user.image || "",
            },
          });
        }
        return true;
      } catch (error) {
        console.error("Error syncing user during sign in:", error);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        // First-time load: append DB user id to token
        try {
          const dbUser = await db.user.findUnique({
            where: { email: user.email },
            select: { id: true },
          });
          if (dbUser) {
            token.userId = dbUser.id;
          }
        } catch (error) {
          console.error("Error fetching user ID for JWT:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.userId) {
        session.user.id = token.userId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
