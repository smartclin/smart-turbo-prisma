"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import appConfig from "@/config/app.config";
import pathsConfig from "@/config/paths.config";
import { authClient } from "@/lib/auth/auth-client";

import {
	type ForgotPasswordSchema,
	forgotPasswordSchema,
} from "../_lib/schema/forgot-password.schema";
import { AuthError } from "./auth-error";
import { AuthSuccess } from "./auth-success";

export function ForgotPasswordForm() {
	const [pending, startTransition] = useTransition();
	const [error, setError] = useState<string | undefined>(undefined);
	const [success, setSuccess] = useState<string | undefined>(undefined);

	const form = useForm<ForgotPasswordSchema>({
		defaultValues: {
			email: "",
		},
		resolver: zodResolver(forgotPasswordSchema),
	});

	const onSubmit = (data: ForgotPasswordSchema) => {
		startTransition(async () => {
			await authClient.forgetPassword(
				{
					email: data.email,
					redirectTo: appConfig.url + pathsConfig.auth.resetPassword,
				},
				{
					onError: ({ error: err }) => {
						setError(err.message);
						setSuccess(undefined);
					},
					onSuccess: () => {
						setError(undefined);
						setSuccess("Check your inbox for the reset link");
					},
				},
			);
		});
	};

	return (
		<Form {...form}>
			<form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
				{error && <AuthError error={error} />}
				{success && <AuthSuccess message={success} />}
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
						</FormItem>
					)}
				/>
				<Button className="w-full" disabled={pending} type="submit">
					{pending ? (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					) : (
						"Reset Password"
					)}
				</Button>
			</form>
		</Form>
	);
}
