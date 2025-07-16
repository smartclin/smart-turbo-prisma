// src/server/routers/auth.ts

import { z } from "zod";
import type { Context } from "@/lib/context";
import { protectedProcedure, publicProcedure, router } from "../lib/trpc";

// Use array of strings for z.enum
const roleSchema = z.enum(["PATIENT", "DOCTOR", "ADMIN", "STAFF"]);

export const authRouter = router({
	// Public query to get current session (may be null)
	getSession: publicProcedure.query(({ ctx }: { ctx: Context }) => {
		return ctx.session || null;
	}),

	// Get current user role as lowercase string, default to "patient"
	getRole: protectedProcedure.query(({ ctx }) => {
		const role = ctx.session?.user?.role?.toLowerCase() || "patient";
		return role;
	}),

	// Check if current user has a specific role
	checkRole: protectedProcedure
		.input(roleSchema)
		.query(({ input: role, ctx }) => {
			const userRole = ctx.session?.user?.role?.toLowerCase();
			return userRole === role.toLowerCase();
		}),
});
