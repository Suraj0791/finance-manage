import { PrismaClient } from "@prisma/client";

//we r doing this as nextjs has hot reload feature , so every time it reloads , it going to generate a new prisma client 
export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}

// we are initializing prisma client as issi se ham db calls and actions krenge


// globalThis.prisma: This global variable ensures that the Prisma client instance is
// reused across hot reloads during development. Without this, each time your application
// reloads, a new instance of the Prisma client would be created, potentially leading
// to connection issues.