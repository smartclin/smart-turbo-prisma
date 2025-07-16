import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
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

import { type TotpSchema, totpSchema } from "../_lib/schema/totp.schema";

export function TwoFactorForm() {
	const router = useRouter();
	const [pending, startTransition] = useTransition();
	const [success, setSuccess] = useState(false);

	const form = useForm<TotpSchema>({
		defaultValues: {
			code: "",
		},
		resolver: zodResolver(totpSchema),
	});

	const onSubmit = async (data: TotpSchema) => {
		startTransition(async () => {
			const res = await authClient.twoFactor.verifyTotp({
				code: data.code,
			});

			if (res.data?.token) {
				setSuccess(true);
				router.refresh();
			} else {
				form.setError("code", { message: "Invalid TOTP code" });
			}
		});
	};

	if (success) {
		return (
			<div className="flex flex-col items-center justify-center space-y-2">
				<CheckCircle2 className="h-12 w-12 text-green-500" />
				<p className="font-semibold text-lg">Verification Successful</p>
			</div>
		);
	}

	return (
		<Form {...form}>
			<form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
				<FormField
					name="code"
					render={({ field }) => (
						<FormItem>
							<FormLabel>TOTP Code</FormLabel>
							<FormControl>
								<Input
									{...field}
									inputMode="numeric"
									maxLength={6}
									pattern="\d{6}"
									placeholder="Enter 6-digit code"
									type="text"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button className="w-full" disabled={pending} type="submit">
					{pending ? (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					) : (
						"Verify"
					)}
				</Button>
			</form>
		</Form>
	);
}
