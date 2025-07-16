import Link from "next/link";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import { OAuthProviders } from "../_components/oauth-providers";
import { PasswordSignUpForm } from "../_components/password-sign-up-form";

export default function RegisterPage() {
	return (
		<>
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Sign Up</CardTitle>
					<CardDescription>Create an account to get started</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<OAuthProviders />
					<div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-border after:border-t">
						<span className="relative z-10 bg-background px-2 text-muted-foreground">
							Or continue with
						</span>
					</div>
					<PasswordSignUpForm />
					<div className="text-center text-sm">
						Already have an account?{" "}
						<Link className="underline underline-offset-4" href="/auth/sign-in">
							Sign in
						</Link>
					</div>
				</CardContent>
			</Card>
			<div className="text-balance text-center text-muted-foreground text-xs [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary ">
				By clicking continue, you agree to our{" "}
				<Link href="#">Terms of Service</Link> and{" "}
				<Link href="#">Privacy Policy</Link>.
			</div>
		</>
	);
}
