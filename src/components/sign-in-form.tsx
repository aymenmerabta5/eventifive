import { authClient } from "@/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import z from "zod";
import Loader from "./loader";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useRouter } from "next/navigation";
import { Card } from "./ui/card";
import { LogIn } from "lucide-react";
import Link from "next/link";

export default function SignInForm({
	onSwitchToSignUp,
}: {
	onSwitchToSignUp: () => void;
}) {
	const router = useRouter();
	const { isPending } = authClient.useSession();

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.signIn.email(
				{
					email: value.email,
					password: value.password,
				},
				{
					onSuccess: () => {
						router.push("/dashboard");
						toast.success("Sign in successful");
					},
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					onError: (error: any) => {
						toast.error(error.error.message || error.error.statusText);
					},
				},
			);
		},
		validators: {
			onSubmit: z.object({
				email: z.string().email("Invalid email address"),
				password: z.string().min(8, "Password must be at least 8 characters"),
			}),
		},
	});

	if (isPending) {
		return <Loader />;
	}

	return (
		<div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
			<div className="relative w-full max-w-lg">
				<div 
					className="absolute inset-0 rounded-xl blur-3xl opacity-10 dark:opacity-40 -z-10"
					style={{
						background: 'oklch(var(--primary))',
						transform: 'scale(1.15)',
					}}
				/>
				<Card className="relative w-full p-8 border-primary/20 dark:border-primary/40 shadow-lg dark:shadow-[0_0_60px_rgba(139,92,246,0.5),0_0_120px_rgba(139,92,246,0.3),0_25px_80px_rgba(0,0,0,0.2),0_10px_30px_rgba(0,0,0,0.3)] backdrop-blur-md bg-card/95">
				<div className="flex flex-col items-center mb-8">
					<LogIn className="size-8 text-primary mb-3" />
					<h1 className="text-3xl font-semibold text-foreground font-display tracking-tight">Welcome Back</h1>
					<p className="text-sm text-muted-foreground mt-2">Sign in to your account</p>
				</div>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="space-y-5  "
				>
					<form.Field name="email">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name} className="text-sm font-medium">
									Email
								</Label>
								<Input
									id={field.name}
									name={field.name}
									type="email"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									className="h-11"
									placeholder="Enter your email"
								/>
								{field.state.meta.errors.map((error) => (
									<p key={error?.message} className="text-sm text-destructive">
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>

					<form.Field name="password">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name} className="text-sm font-medium">
									Password
								</Label>
								<Input
									id={field.name}
									name={field.name}
									type="password"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									className="h-11 "
									placeholder="Enter your password"
								/>
								{field.state.meta.errors.map((error) => (
									<p key={error?.message} className="text-sm text-destructive">
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>

					<form.Subscribe>
						{(state) => (
							<Button
								type="submit"
								className="w-full h-11 mt-6 rounded-4xl "
								disabled={!state.canSubmit || state.isSubmitting}
							>
								{state.isSubmitting ? "Signing in..." : "Sign In"}
							</Button>
						)}
					</form.Subscribe>
				</form>
				<div className="relative my-6">
					<hr className="border-border" />
					<span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-sm text-muted-foreground">
						Or
					</span>
				</div>

				<div className="space-y-3 text-center">
					<Button
						variant="link"
						onClick={onSwitchToSignUp}
						className="text-sm text-muted-foreground hover:text-primary h-auto p-0"
					>
						Don't have an account? <span className="text-primary font-medium">Sign Up</span>
					</Button>
					
					<Button
						variant="link"
						asChild
						className="text-sm text-muted-foreground hover:text-primary h-auto p-0 block"
					>
						<Link href="/reset-password">
							Forgot password?
						</Link>
					</Button>
				</div>
			</Card>
			</div>
		</div>
	);
}
