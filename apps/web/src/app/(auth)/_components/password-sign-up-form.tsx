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
import appConfig from "@/config/app.config";
import pathsConfig from "@/config/paths.config";
import { authClient } from "@/lib/auth/auth-client";

import { type SignUpSchema, signUpSchema } from "../_lib/schema/sign-up.schema";
import { AuthError } from "./auth-error";
import { AuthSuccess } from "./auth-success";

export function PasswordSignUpForm() {
	const [pending, startTransition] = useTransition();
	const [error, setError] = useState<string | undefined>(undefined);
	const [success, setSuccess] = useState<string | undefined>(undefined);

	const form = useForm<SignUpSchema>({
		defaultValues: {
			name: "",
			email: "",
			password: "",
		},
		resolver: zodResolver(signUpSchema),
	});

	const onSubmit = async (data: SignUpSchema) => {
		startTransition(async () => {
			await authClient.signUp.email(
				{
					name: data.name,
					email: data.email,
					password: data.password,
					callbackURL: appConfig.url + pathsConfig.app.home,
				},
				{
					onSuccess: () => {
						setError(undefined);
						setSuccess(
							"Account created successfully. Please check your email to verify your account.",
						);
					},
					onError: ({ error }) => {
						setError(error.message);
						setSuccess(undefined);
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
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Name</FormLabel>
							<FormControl>
								<Input {...field} placeholder="John Doe" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input
									{...field}
									placeholder="john.doe@example.com"
									type="email"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
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
				<Button className="w-full" disabled={pending} type="submit">
					{pending ? (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					) : (
						"Sign Up"
					)}
				</Button>
			</form>
		</Form>
	);
}
