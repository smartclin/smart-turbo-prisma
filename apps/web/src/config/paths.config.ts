import { z } from "zod";

const PathsSchema = z.object({
	auth: z.object({
		signIn: z.string().min(1),
		signUp: z.string().min(1),
		forgotPassword: z.string().min(1),
		resetPassword: z.string().min(1),
		twoFactor: z.string().min(1),
	}),
	app: z.object({
		home: z.string().min(1),
		account: z.string().min(1),
		security: z.string().min(1),
	}),
	admin: z.object({
		root: z.string().min(1),
		users: z.string().min(1),
		settings: z.string().min(1),
	}),
	doctor: z.string().min(1),
	patient: z.object({
		root: z.string().min(1),
		patients: z.string().min(1),
		registration: z.string().min(1),
	}),
	record: z.object({
		root: z.string().min(1),
		appointments: z.object({
			root: z.string().min(1),
			appointmentId: z.string().min(1), // used as base string in Zod, not a function
		}),
		billing: z.string().min(1),
		doctors: z.object({
			root: z.string().min(1),
			doctorId: z.string().min(1), // same here
		}),
		medicalRecords: z.string().min(1),
		patients: z.string().min(1),
		staffs: z.string().min(1),
		users: z.string().min(1),
	}),
});

const pathsConfig = PathsSchema.parse({
	auth: {
		signIn: "/auth/sign-in",
		signUp: "/auth/sign-up",
		forgotPassword: "/auth/forgot-password",
		resetPassword: "/auth/reset-password",
		twoFactor: "/auth/two-factor",
	},
	app: {
		home: "/home",
		account: "/home/account",
		security: "/home/security",
	},
	admin: {
		root: "/admin",
		users: "/admin/users",
		settings: "/admin/system-settings",
	},
	doctor: "/doctor",
	patient: {
		root: "/patient",
		patients: "/record/patients",
		registration: "/patient/registration",
	},
	record: {
		root: "/record",
		appointments: {
			root: "/record/appointments",
			appointmentId: "/record/appointments/:id",
		},
		billing: "/record/billing",
		doctors: {
			root: "/record/doctors",
			doctorId: "/record/doctors/:id",
		},
		medicalRecords: "/record/medical-records",
		patients: "/record/patients",
		staffs: "/record/staffs",
		users: "/record/users",
	},
});

export default pathsConfig;

// ✅ Dynamic versions (outside Zod)
export const dynamicPaths = {
	appointmentDetails: (id: string) => `/record/appointments/${id}`,
	doctorDetails: (id: string) => `/record/doctors/${id}`,
	patientDetails: (id: string) => `/patient/${id}`,
};
