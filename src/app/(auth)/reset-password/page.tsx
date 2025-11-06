import ReturnBack from "@/components/return-back";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Key } from "lucide-react";
import Link from "next/link";

export default function ResetPasswordPage() {
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

						<form className="space-y-5">
							<div className="space-y-2">
								<Label htmlFor="email" className="text-sm font-medium">
									Email
								</Label>
								<Input
									id="email"
									type="email"
									className="h-11"
									placeholder="Enter your email"
								/>
							</div>

							<Button type="submit"   className="mt-6 h-11 w-full rounded-4xl">
								Confirm 
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