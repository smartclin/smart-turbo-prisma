"use server";

import { auth } from "@/lib/auth";
import { type ReviewFormValues, reviewSchema } from "@/lib/helper";
import prisma from "../../prisma";

export async function deleteDataById(
	id: string,

	deleteType: "doctor" | "staff" | "patient" | "payment" | "bill",
) {
	try {
		switch (deleteType) {
			case "doctor":
				await prisma.doctor.delete({ where: { id: id } });
				break;
			case "staff":
				await prisma.staff.delete({ where: { id: id } });
				break;
			case "patient":
				await prisma.patient.delete({ where: { id: id } });
				break;
			case "payment":
				await prisma.payment.delete({ where: { id: Number(id) } });
		}

		if (
			deleteType === "staff" ||
			deleteType === "patient" ||
			deleteType === "doctor"
		) {
			await auth.api.deleteUser({ body: {} });
		}

		return {
			success: true,
			message: "Data deleted successfully",
			status: 200,
		};
	} catch (error) {
		console.log(error);

		return {
			success: false,
			message: "Internal Server Error",
			status: 500,
		};
	}
}
export const createReviewInput = reviewSchema;
export async function createReview(values: ReviewFormValues) {
	try {
		const validatedFields = reviewSchema.parse(values);

		await prisma.rating.create({
			data: {
				...validatedFields,
			},
		});

		return {
			success: true,
			message: "Review created successfully",
			status: 200,
		};
	} catch (error) {
		console.log(error);

		return {
			success: false,
			message: "Internal Server Error",
			status: 500,
		};
	}
}
