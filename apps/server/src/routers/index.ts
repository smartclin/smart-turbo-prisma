import { protectedProcedure, publicProcedure, router } from "../lib/trpc";
import { adminRouter } from "./Admin.router";
import { appointmentRouter } from "./Appointment.router";
import { authRouter } from "./auth";
import { doctorRouter } from "./Doctor.router";
import { medicalRecordsRouter } from "./MedicalRecords.router";
import { patientRouter } from "./Patient.router";
import { paymentRouter } from "./Payment.router";
import { staffRouter } from "./Staff.router";
import { todoRouter } from "./todo";
import { vitalSignsRouter } from "./VitalSigns.router";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	privateData: protectedProcedure.query(({ ctx }) => {
		return {
			message: "This is private",
			user: ctx.session.user,
		};
	}),
	todo: todoRouter,
	vitalSigns: vitalSignsRouter,
	staff: staffRouter,
	payment: paymentRouter,
	patient: patientRouter,
	medicalRecords: medicalRecordsRouter,
	doctor: doctorRouter,
	appointment: appointmentRouter,
	admin: adminRouter,
	auth: authRouter,
});
export type AppRouter = typeof appRouter;
