// src/trpc/routers/staff.ts
// This file defines the tRPC procedures related to staff.

import { TRPCError } from "@trpc/server";
import { z } from "zod"; // Zod for input validation
import { createReviewInput } from "@/actions/general";
// Import your existing Prisma-based service function
import { getAllStaff } from "@/utils/services/staff"; // Adjust path if different
import prisma from "../../prisma";
// Import your tRPC setup (e.g., from src/trpc/init.ts)
import { protectedProcedure, router } from "../lib/trpc";

export const staffRouter = router({
	/**
	 * Fetches all staff records with pagination and search capabilities.
	 * This procedure calls the `getAllStaff` function from the service layer.
	 *
	 * Input:
	 * - page (number | string): The current page number, defaults to 1.
	 * - limit (number | string, optional): The number of records per page, defaults to 10.
	 * - search (string, optional): A search term to filter staff by name, phone, or email.
	 *
	 * Output:
	 * - success (boolean): Indicates if the operation was successful.
	 * - data (Staff[]): Array of staff records.
	 * - totalRecords (number): Total number of records matching the criteria.
	 * - totalPages (number): Total number of pages.
	 * - currentPage (number): The current page number.
	 * - status (number): HTTP-like status code.
	 */
	getAllStaff: protectedProcedure
		.input(
			z.object({
				// Validate and transform 'page' to a number, ensuring it's at least 1.
				page: z
					.union([z.number(), z.string()])
					.transform((val) => (Number(val) <= 0 ? 1 : Number(val))),
				// Validate and transform 'limit' to a number, making it optional.
				limit: z
					.union([z.number(), z.string()])
					.transform((val) => Number(val))
					.optional(),
				// 'search' term is an optional string.
				search: z.string().optional(),
			}),
		)
		.query(async ({ input }) => {
			// Use .query() as this is a read operation
			try {
				// Call your existing Prisma-based `getAllStaff` service function.
				// The input from tRPC is directly compatible with the service function's parameters.
				const result = await getAllStaff(input);

				// Return the result received from the service function.
				// The service function already returns the desired success, data, pagination info, and status.
				return result;
			} catch (error) {
				// Log the error for server-side debugging.
				console.error(
					"Error in tRPC staffRouter.getAllStaff procedure:",
					error,
				);

				// If the caught error is already a TRPCError (e.g., re-thrown from a utility),
				// re-throw it as is.
				if (error instanceof TRPCError) {
					throw error;
				}

				// For any other unexpected errors (like the generic Error thrown by the service),
				// throw a generic INTERNAL_SERVER_ERROR to the client.
				// This prevents leaking sensitive error details to the frontend.
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to fetch staff data. Please try again later.",
				});
			}
		}),

	createReview: protectedProcedure
		.input(createReviewInput)
		.mutation(async ({ input }) => {
			try {
				// validated by zod already
				await prisma.rating.create({ data: input });

				return {
					success: true,
					message: "Review created successfully",
					status: 200,
				};
			} catch (err) {
				console.error(err);
				return {
					success: false,
					message: "Internal Server Error",
					status: 500,
				};
			}
		}),
});
