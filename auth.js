import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { withDbConnection } from "@/lib/db-wrapper";

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
        // Sync user with our database using retry wrapper
        const dbUser = await withDbConnection(async (prisma) => {
          let existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            existingUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || "User",
                imageUrl: user.image || "",
              },
            });
          }
          return existingUser;
        });

        return !!dbUser;
      } catch (error) {
        console.error("Error syncing user during sign in:", error);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        // First-time load: append DB user id to token using retry wrapper
        try {
          const dbUser = await withDbConnection(async (prisma) => {
            return await prisma.user.findUnique({
              where: { email: user.email },
              select: { id: true },
            });
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
