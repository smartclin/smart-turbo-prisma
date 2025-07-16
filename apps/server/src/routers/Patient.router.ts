// src/trpc/routers/patient.ts
// This file defines the tRPC procedures related to patient data.

import { TRPCError } from "@trpc/server";
import { z } from "zod"; // Zod for input validation
import type { ApiResponse, PatientFullData } from "../utils/services/patient";
export type { ApiResponse, PatientFullData }; // re-export types

import { createNewPatient, updatePatient } from "@/actions/patient";
import {
	PatientCreateInputSchema,
	PatientUpdateInputSchema,
} from "@/lib/schema";
// Import your existing Prisma-based patient service functions
import {
	getAllPatients,
	getPatientById,
	getPatientDashboardStatistics,
	getPatientFullDataById,
} from "@/utils/services/patient"; // Adjust path if different
// Import your tRPC setup (e.g., from src/trpc/init.ts)
import { protectedProcedure, router } from "../lib/trpc";

export const patientRouter = router({
	/**
	 * Fetches dashboard statistics for a specific patient.
	 * Input: patientId (string)
	 */
	getPatientDashboardStatistics: protectedProcedure
		.input(z.string()) // Patient ID
		.query(async ({ input: id }) => {
			try {
				const result = await getPatientDashboardStatistics(id);
				return result;
			} catch (error) {
				console.error(
					"Error in tRPC patientRouter.getPatientDashboardStatistics:",
					error,
				);
				if (error instanceof TRPCError) {
					throw error;
				}
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to fetch patient dashboard statistics.",
				});
			}
		}),

	/**
	 * Fetches a single patient record by ID.
	 * Input: id (string)
	 */
	getPatientById: protectedProcedure
		.input(z.string()) // Patient ID
		.query(async ({ input: id }) => {
			try {
				const result = await getPatientById(id);
				return result;
			} catch (error) {
				console.error("Error in tRPC patientRouter.getPatientById:", error);
				if (error instanceof TRPCError) {
					throw error;
				}
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to fetch patient by ID.",
				});
			}
		}),

	/**
	 * Fetches full patient data by ID or email, including total appointments and last visit.
	 * Input: idOrEmail (string)
	 */
	getPatientFullDataById: protectedProcedure
		.input(z.string()) // Patient ID or Email
		.query(async ({ input: idOrEmail }) => {
			try {
				const result = await getPatientFullDataById(idOrEmail);
				return result;
			} catch (error) {
				console.error(
					"Error in tRPC patientRouter.getPatientFullDataById:",
					error,
				);
				if (error instanceof TRPCError) {
					throw error;
				}
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to fetch full patient data.",
				});
			}
		}),

	/**
	 * Fetches all patient records with pagination and search capabilities.
	 * Input: { page, limit, search }
	 */
	getAllPatients: protectedProcedure
		.input(
			z.object({
				page: z
					.union([z.number(), z.string()])
					.transform((val) => (Number(val) <= 0 ? 1 : Number(val))),
				limit: z
					.union([z.number(), z.string()])
					.transform((val) => Number(val))
					.optional(),
				search: z.string().optional(),
			}),
		)
		.query(async ({ input }) => {
			try {
				const result = await getAllPatients(input);
				return result;
			} catch (error) {
				console.error("Error in tRPC patientRouter.getAllPatients:", error);
				if (error instanceof TRPCError) {
					throw error;
				}
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to fetch all patients.",
				});
			}
		}),
	updatePatient: protectedProcedure
		.input(PatientUpdateInputSchema)
		.mutation(async ({ input }) => {
			const { pid, ...patientData } = input;
			// call your async action, pass patientData and pid
			return await updatePatient(patientData, pid);
		}),

	createNewPatient: protectedProcedure
		.input(PatientCreateInputSchema)
		.mutation(async ({ input }) => {
			const { pid, ...patientData } = input;
			return await createNewPatient(patientData, pid);
		}),
});
