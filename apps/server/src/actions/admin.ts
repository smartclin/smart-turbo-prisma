"use server";

import type { ServicesCreateInput } from "prisma/generated/models";
import z, { treeifyError } from "zod";
import { auth, getSession } from "@/lib/auth";
import { StaffAuthSchema } from "@/lib/helper"; // wherever you export above
import { DoctorSchema, ServicesSchema, WorkingDaysSchema } from "@/lib/schema";
import { generateRandomColor } from "@/utils";
import { checkRole } from "@/utils/roles";
import prisma from "../../prisma";

export type StaffAuthInput = z.infer<typeof StaffAuthSchema>;

export async function createNewStaff(data: StaffAuthInput) {
	try {
		const session = await getSession();
		if (!session?.user?.id || !(await checkRole("ADMIN"))) {
			return { success: false, message: "Unauthorized" };
		}

		const result = StaffAuthSchema.safeParse(data);
		if (!result.success) {
			return {
				success: false,
				errors: treeifyError(result.error),
				message: "Invalid input data",
			};
		}
		const {
			password,
			name,
			email,
			phone,
			address,
			department,
			img,
			licenseNumber,
			colorCode,
			hireDate,
			salary,
			role,
			status,
		} = result.data;

		const [firstName, ...restName] = name.trim().split(" ");
		const lastName = restName.join(" ");

		// 1. Create user for this staff with auth system
		const user = await auth.api.createUser({
			body: {
				email,
				password,
				name: `${firstName} ${lastName}`,
				role, // assign staff role here from validated input
			},
		});

		// 2. Create staff record linked to user.id with all required fields
		await prisma.staff.create({
			data: {
				id: user.user.id,
				userId: user.user.id,
				name,
				email,
				phone,
				address,
				department,
				img,
				licenseNumber,
				colorCode: colorCode ?? generateRandomColor(),
				hireDate,
				salary,
				role,
				status: status ?? "ACTIVE",
			},
		});

		return { success: true, message: "Staff added successfully", error: false };
	} catch (error) {
		console.error(error);
		return { success: false, error: true, message: "Something went wrong" };
	}
}
// Extend DoctorSchema to add password field
export const DoctorAuthSchema = DoctorSchema.extend({
	password: z.string().min(6, "Password should be at least 6 characters long"),
});

// Resulting input type
export type DoctorAuthInput = z.infer<typeof DoctorAuthSchema>;

export type WorkScheduleInput = z.infer<typeof WorkingDaysSchema>;

export async function createNewDoctor(
	data: z.infer<typeof DoctorAuthSchema> & {
		workSchedule: WorkScheduleInput[];
	},
) {
	try {
		const doctorResult = DoctorAuthSchema.safeParse(data);
		const workScheduleResult = z
			.array(WorkingDaysSchema)
			.safeParse(data.workSchedule);

		if (!doctorResult.success || !workScheduleResult.success) {
			return {
				success: false,
				errors: {
					doctor: doctorResult.success
						? undefined
						: treeifyError(doctorResult.error),
					workSchedule: workScheduleResult.success
						? undefined
						: treeifyError(workScheduleResult.error),
				},
				message: "Please provide valid and complete doctor and schedule data",
			};
		}

		// Destructure validated data
		const { password, name, ...doctorData } = doctorResult.data;
		const workSchedule = workScheduleResult.data;

		const [firstName, ...restName] = name.trim().split(" ");
		const lastName = restName.join(" ");

		// Create user account
		const user = await auth.api.createUser({
			body: {
				email: doctorData.email,
				password,
				name: `${firstName} ${lastName}`,
				role: "DOCTOR",
			},
		});

		// Create doctor record linked to user ID
		const doctor = await prisma.doctor.create({
			data: {
				...doctorData,
				id: user.user.id,
				userId: user.user.id,
				name,
			},
		});

		// Create work schedule entries if provided
		if (workSchedule.length > 0) {
			await Promise.all(
				workSchedule.map((ws) =>
					prisma.workingDays.create({
						data: { ...ws, doctorId: doctor.id },
					}),
				),
			);
		}

		return {
			success: true,
			message: "Doctor added successfully",
			error: false,
		};
	} catch (error) {
		console.error(error);
		return { success: false, error: true, message: "Something went wrong" };
	}
}

export async function addNewService(data: ServicesCreateInput) {
	try {
		const result = ServicesSchema.safeParse(data);
		if (!result.success) {
			return { success: false, msg: "Invalid data" };
		}

		const { price, ...rest } = result.data;

		await prisma.services.create({
			data: { ...rest, price: Number(price) },
		});

		return { success: true, error: false, msg: "Service added successfully" };
	} catch (error) {
		console.error(error);
		return { success: false, msg: "Internal Server Error" };
	}
}
