"use client";

import ReturnBack from "@/components/return-back";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Key } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import Turnstile, { useTurnstile } from "react-turnstile";
import { env } from "@/env";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [token, setToken] = useState<string | null>(null);
	const turnstile = useTurnstile();
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		
		if (!email) {
			toast.error("Please enter your email address");
			return;
		}

		if (!token) {
			toast.error("Please solve the captcha");
			return;
		}

		setIsLoading(true);

		try {
			await authClient.forgetPassword(
				{
					email,
					fetchOptions: {
						headers: {
							"x-captcha-response": token ?? "",
						},
					},
				},
				{
					onSuccess: () => {
						toast.success("Preccessing to reset password...");
						setEmail("");
						setToken(null);
						turnstile?.reset();
						router.push("/reset-password/set-password");
					},
					onError: (error: any) => {
						toast.error(error.error?.message || "Failed to send reset email. Please try again.");
						turnstile?.reset();
						setToken(null);
					},
				},
			);
		} catch (error) {
			toast.error("An unexpected error occurred. Please try again.");
			turnstile?.reset();
			setToken(null);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<ReturnBack />
			<div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
				<div className="relative w-full max-w-lg">
					<div
						className="absolute inset-0 -z-10 rounded-xl opacity-10 blur-3xl dark:opacity-40"
						style={{
							background: "oklch(var(--primary))",
							transform: "scale(1.15)",
						}}
					/>
					<Card className="border-primary/20 dark:border-primary/40 bg-card/95 relative w-full p-8 shadow-lg backdrop-blur-md dark:shadow-[0_0_60px_rgba(139,92,246,0.5),0_0_120px_rgba(139,92,246,0.3),0_25px_80px_rgba(0,0,0,0.2),0_10px_30px_rgba(0,0,0,0.3)]">
						<div className="mb-8 flex flex-col items-center">
							<Key className="text-primary mb-3 size-8" />
							<h1 className="text-foreground font-display text-3xl font-semibold tracking-tight">
								Reset Password
							</h1>
							<p className="text-muted-foreground mt-2 text-sm">
								Enter your email to reset your password
							</p>
						</div>

						<form onSubmit={handleSubmit} className="space-y-5">
							<div className="space-y-2">
								<Label htmlFor="email" className="text-sm font-medium">
									Email
								</Label>
								<Input
									id="email"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="h-11"
									placeholder="Enter your email"
									disabled={isLoading}
									required
								/>
							</div>

							<div className="flex justify-center">
								<Turnstile
									sitekey={env.NEXT_PUBLIC_CLOUDFLARE_TURNSTYLE_PK}
									onVerify={(token) => {
										setToken(token);
									}}
									onError={() => {
										turnstile?.reset();
										setToken(null);
									}}
								/>
							</div>

							<Button 
								type="submit" 
								className="mt-6 h-11 w-full rounded-4xl"
								disabled={isLoading || !token}
							>
								{isLoading ? "Sending..." : "Confirm"}
								
							</Button>
						</form>

						<div className="mt-6 text-center">
							<Button
								variant="link"
								asChild
								className="text-muted-foreground hover:text-primary h-auto p-0 text-sm"
							>
								<Link href="/login">Back to login</Link>
							</Button>
						</div>
					</Card>
				</div>
			</div>
		</>
	);
}