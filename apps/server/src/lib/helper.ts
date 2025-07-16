import { z } from "zod";
import {
	DiagnosisSchema,
	PatientBillsSchema,
	PaymentCreateInputSchema,
} from "./schema";

export const StaffAuthSchema = z.object({
	name: z.string().min(1),
	email: z.email(),
	phone: z.string().min(1),
	address: z.string().min(1),
	department: z.string().optional().nullable(),
	img: z.string().optional().nullable(),
	licenseNumber: z.string().optional().nullable(),
	colorCode: z.string().optional().nullable(),
	hireDate: z.date().optional(),
	salary: z.number().optional().nullable(),
	role: z.enum(["ADMIN", "DOCTOR", "STAFF", "PATIENT"]),
	status: z.enum(["ACTIVE", "INACTIVE", "DORMANT"]).optional(),
	password: z.string().min(6, "Password should be at least 6 characters long"),
});
export type DiagnosisFormData = z.infer<typeof DiagnosisSchema>;

export const reviewSchema = z.object({
	patientId: z.string(),
	staffId: z.string(),
	rating: z.number().min(1).max(5),
	comment: z
		.string()
		.min(1, "Review must be at least 10 characters long")
		.max(500, "Review must not exceed 500 characters"),
});

export type ReviewFormValues = z.infer<typeof reviewSchema>;

export const AddDiagnosisInput = DiagnosisSchema.extend({
	appointmentId: z.string(), // or z.number() if applicable
});

export const AddNewBillInput = PatientBillsSchema.extend({
	appointmentId: z
		.union([z.string(), z.number()])
		.transform((val) => Number(val)),
	billId: z
		.union([z.number(), z.null(), z.undefined()])
		.optional()
		.transform((val) => (val === 0 ? undefined : val)),
});

export const GenerateBillInput = PaymentCreateInputSchema;

export const PatientFormSchema = z.object({
	firstName: z
		.string()
		.trim()
		.min(2, "First name must be at least 2 characters")
		.max(30, "First name can't be more than 50 characters"),
	lastName: z
		.string()
		.trim()
		.min(2, "dLast name must be at least 2 characters")
		.max(30, "First name can't be more than 50 characters"),
	dateOfBirth: z.coerce.date(),
	gender: z.enum(["MALE", "FEMALE"], { message: "Gender is required" }),

	phone: z.string().min(10, "Enter phone number").max(10, "Enter phone number"),
	email: z.email("Invalid email address."),
	address: z
		.string()
		.min(5, "Address must be at least 5 characters")
		.max(500, "Address must be at most 500 characters"),
	maritalStatus: z
		.enum(["married", "single", "divorced", "widowed", "separated"], {
			message: "Marital status is required.",
		})
		.optional(),
	nutritionalStatus: z
		.enum(["normal", "underweight", "overweight", "stunted", "obese"], {
			message: "Nutritional status is required.",
		})
		.optional(),
	emergencyContactName: z
		.string()
		.min(2, "Emergency contact name is required.")
		.max(50, "Emergency contact must be at most 50 characters"),
	emergencyContactNumber: z
		.string()
		.min(10, "Enter phone number")
		.max(10, "Enter phone number")
		.optional(),
	relation: z
		.enum(["mother", "father", "husband", "wife", "other"], {
			message: "Relations with contact person required",
		})
		.optional(),
	bloodGroup: z.string().optional(),
	allergies: z.string().optional(),
	medicalConditions: z.string().optional(),
	medicalHistory: z.string().optional(),
	insuranceProvider: z.string().optional(),
	insuranceNumber: z.string().optional(),
	privacyConsent: z
		.boolean()
		.default(false)
		.refine((val) => val === true, {
			message: "You must agree to the privacy policy.",
		})
		.optional(),
	serviceConsent: z
		.boolean()
		.default(false)
		.refine((val) => val === true, {
			message: "You must agree to the terms of service.",
		})
		.optional(),
	medicalConsent: z
		.boolean()
		.default(false)
		.refine((val) => val === true, {
			message: "You must agree to the medical treatment terms.",
		})
		.optional(),
	img: z.string().optional(),
});

export const PatientInputSchema = PatientFormSchema;

// For createNewPatient we also expect a patient id string (pid)
export const CreateNewPatientInput = PatientFormSchema.extend({
	pid: z.string(),
});

export const UpdatePatientInput = PatientFormSchema.extend({
	pid: z.string(),
});
