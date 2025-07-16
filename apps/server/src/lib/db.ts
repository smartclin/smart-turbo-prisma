// apps/server/lib/db.ts (or prisma.ts)
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

// Extend Prisma with Accelerate
const createClient = () => new PrismaClient().$extends(withAccelerate());

// Correct type
type ExtendedPrismaClient = ReturnType<typeof createClient>;

// Use globalThis for dev hot-reload caching
const globalForPrisma = globalThis as unknown as {
	prisma?: ExtendedPrismaClient;
};

// Prevent multiple instances in dev
export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
	globalForPrisma.prisma = db;
}
