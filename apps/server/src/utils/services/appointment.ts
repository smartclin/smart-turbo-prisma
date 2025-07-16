import { db } from "@/lib/db";

export async function getAppointmentById(id: number) {
	try {
		if (!id) {
			return {
				success: false,
				message: "Appointment id does not exist.",
				status: 404,
			};
		}

		const data = await db.appointment.findUnique({
			where: { id },
			include: {
				doctor: {
					select: { id: true, name: true, specialization: true, img: true },
				},
				patient: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						dateOfBirth: true,
						gender: true,
						img: true,
						address: true,
						phone: true,
					},
				},
			},
		});

		if (!data) {
			return {
				success: false,
				message: "Appointment data not found",
				status: 200,
				data: null,
			};
		}

		return { success: true, data, status: 200 };
	} catch (error) {
		console.log(error);
		return { success: false, message: "Internal Server Error", status: 500 };
	}
}

interface AllAppointmentsProps {
	page: number | string;
	limit?: number | string;
	search?: string;
	id?: string;
}

const buildQuery = (id?: string, search?: string) => {
	// Base conditions for search if it exists
	const searchConditions: Prisma.AppointmentWhereInput = search
		? {
				OR: [
					{
						patient: {
							firstName: { contains: search, mode: "insensitive" },
						},
					},
					{
						patient: {
							lastName: { contains: search, mode: "insensitive" },
						},
					},
					{
						doctor: {
							name: { contains: search, mode: "insensitive" },
						},
					},
				],
			}
		: {};

	// ID filtering conditions if ID exists
	const idConditions: Prisma.AppointmentWhereInput = id
		? {
				OR: [{ patientId: id }, { doctorId: id }],
			}
		: {};

	// Combine both conditions with AND if both exist
	const combinedQuery: Prisma.AppointmentWhereInput =
		id || search
			? {
					AND: [
						...(Object.keys(searchConditions).length > 0
							? [searchConditions]
							: []),
						...(Object.keys(idConditions).length > 0 ? [idConditions] : []),
					],
				}
			: {};

	return combinedQuery;
};

export async function getPatientAppointments({
	page,
	limit,
	search,
	id,
}: AllAppointmentsProps) {
	try {
		const PAGE_NUMBER = Number(page) <= 0 ? 1 : Number(page);
		const LIMIT = Number(limit) || 10;

		const SKIP = (PAGE_NUMBER - 1) * LIMIT; //0 -9

		const [data, totalRecord] = await Promise.all([
			db.appointment.findMany({
				where: buildQuery(id, search),
				skip: SKIP,
				take: LIMIT,
				select: {
					id: true,
					patientId: true,
					doctorId: true,
					type: true,
					appointmentDate: true,
					time: true,
					status: true,
					patient: {
						select: {
							id: true,
							firstName: true,
							lastName: true,
							phone: true,
							gender: true,
							img: true,
							dateOfBirth: true,
							colorCode: true,
						},
					},
					doctor: {
						select: {
							id: true,
							name: true,
							specialization: true,
							colorCode: true,
							img: true,
						},
					},
				},
				orderBy: { appointmentDate: "desc" },
			}),
			db.appointment.count({
				where: buildQuery(id, search),
			}),
		]);

		if (!data) {
			return {
				success: false,
				message: "Appointment data not found",
				status: 200,
				data: null,
			};
		}

		const totalPages = Math.ceil(totalRecord / LIMIT);

		return {
			success: true,
			data,
			totalPages,
			currentPage: PAGE_NUMBER,
			totalRecord,
			status: 200,
		};
	} catch (error) {
		console.log(error);
		return { success: false, message: "Internal Server Error", status: 500 };
	}
}

export async function getAppointmentWithMedicalRecordsById(id: number) {
	try {
		if (!id) {
			return {
				success: false,
				message: "Appointment id does not exist.",
				status: 404,
			};
		}

		const data = await db.appointment.findUnique({
			where: { id },
			include: {
				patient: true,
				doctor: true,
				bills: true,
				medical: {
					include: {
						diagnosis: true,
						labTest: true,
						vital_signs: true,
					},
				},
			},
		});

		if (!data) {
			return {
				success: false,
				message: "Appointment data not found",
				status: 200,
			};
		}

		return { success: true, data, status: 200 };
	} catch (error) {
		console.log(error);
		return { success: false, message: "Internal Server Error", status: 500 };
	}
}
