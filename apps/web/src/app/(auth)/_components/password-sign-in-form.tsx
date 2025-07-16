"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

import { type SignInSchema, signInSchema } from "../_lib/schema/sign-in.schema";
import { AuthError } from "./auth-error";

export function PasswordSignInForm() {
	const router = useRouter();
	const [pending, startTransition] = useTransition();
	const [error, setError] = useState<string | undefined>(undefined);

	const form = useForm<SignInSchema>({
		defaultValues: {
			email: "",
			password: "",
			rememberMe: true,
		},
		resolver: zodResolver(signInSchema),
	});

	const onSubmit = async (data: SignInSchema) => {
		startTransition(async () => {
			await authClient.signIn.email(
				{
					email: data.email,
					password: data.password,
					rememberMe: data.rememberMe,
					callbackURL: appConfig.url + pathsConfig.app.home,
				},
				{
					onSuccess: (context) => {
						setError(undefined);
						if (context.data.twoFactorRedirect) {
							router.push(appConfig.url + pathsConfig.auth.twoFactor);
						}
					},
					onError: ({ error }) => {
						setError(error.message);
					},
				},
			);
		});
	};

	return (
		<Form {...form}>
			<form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
				{error && <AuthError error={error} />}
				<FormField
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input {...field} placeholder="john.doe@example.com" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					name="password"
					render={({ field }) => (
						<FormItem>
							<div className="flex items-center">
								<FormLabel htmlFor="password">Password</FormLabel>
								<Link
									className="ml-auto text-sm underline-offset-4 hover:underline"
									href="/auth/forgot-password"
								>
									Forgot your password?
								</Link>
							</div>
							<FormControl>
								<Input {...field} type="password" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					name="rememberMe"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<div className="flex items-center gap-2">
									<Checkbox {...field} defaultChecked={field.value} />
									<FormLabel>Remember me</FormLabel>
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button className="w-full" disabled={pending} type="submit">
					{pending ? (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					) : (
						"Sign In"
					)}
				</Button>
			</form>
		</Form>
	);
}
