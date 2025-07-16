// src/trpc/routers/payment.ts
// This file defines the tRPC procedures related to payments.

import { TRPCError } from "@trpc/server";
import { z } from "zod"; // Zod for input validation
import { addDiagnosis, addNewBill, generateBill } from "@/actions/medical";
import {
	AddDiagnosisInput,
	AddNewBillInput,
	GenerateBillInput,
} from "@/lib/helper";
// Import your existing Prisma-based service function
import { getPaymentRecords } from "@/utils/services/payments"; // Adjust path if different
// Import your tRPC setup (e.g., from src/trpc/init.ts)
import { protectedProcedure, router } from "../lib/trpc";

export const paymentRouter = router({
	getPaymentRecords: protectedProcedure
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
				// Call your existing Prisma-based `getPaymentRecords` service function.
				// The input from tRPC is directly compatible with the service function's parameters.
				const result = await getPaymentRecords(input);
				return result;
			} catch (error) {
				// Log the error for server-side debugging.
				console.error(
					"Error in tRPC paymentRouter.getPaymentRecords procedure:",
					error,
				);
				if (error instanceof TRPCError) {
					throw error;
				}

				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to fetch payment records. Please try again later.",
				});
			}
		}),
	addDiagnosis: protectedProcedure
		.input(AddDiagnosisInput)
		.mutation(async ({ input }) => {
			const { appointmentId, ...diagnosisData } = input;
			// call your action function
			return addDiagnosis(diagnosisData, appointmentId.toString());
		}),
	addNewBill: protectedProcedure
		.input(AddNewBillInput)
		.mutation(async ({ input }) => {
			return addNewBill(input);
		}),

	generateBill: protectedProcedure
		.input(GenerateBillInput)
		.mutation(async ({ input }) => {
			return generateBill(input);
		}),
});
