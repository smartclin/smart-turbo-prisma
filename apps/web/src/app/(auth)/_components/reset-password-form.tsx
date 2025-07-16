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
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth/auth-client";

import {
	type ResetPasswordSchema,
	resetPasswordSchema,
} from "../_lib/schema/reset-password.schema";
import { AuthError } from "./auth-error";
import { AuthSuccess } from "./auth-success";

export function ResetPasswordForm({ token }: { token: string }) {
	const [pending, startTransition] = useTransition();
	const [error, setError] = useState<string | undefined>(undefined);
	const [success, setSuccess] = useState<string | undefined>(undefined);

	const form = useForm<ResetPasswordSchema>({
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
		resolver: zodResolver(resetPasswordSchema),
	});

	const onSubmit = async (data: ResetPasswordSchema) => {
		startTransition(async () => {
			await authClient.resetPassword(
				{
					newPassword: data.password,
					token,
				},
				{
					onError: ({ error: err }) => {
						setError(err.message);
						setSuccess(undefined);
					},
					onSuccess: () => {
						setError(undefined);
						setSuccess("Password reset successfully");
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
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Password</FormLabel>
							<FormControl>
								<Input {...field} type="password" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="confirmPassword"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Confirm Password</FormLabel>
							<FormControl>
								<Input {...field} type="password" />
							</FormControl>
							<FormMessage />
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
