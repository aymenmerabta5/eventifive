import ReturnBack from "@/components/return-back";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ResetPasswordPage() {
	return (
		<div className="flex flex-col items-center mt-10 h-svh gap-5">
			<ReturnBack />
			<h1 className="text-2xl font-bold">Reset Password</h1>
			<p className="text-sm text-muted-foreground">Enter your email to reset your password</p>
			<form className="flex flex-col gap-5">
				<Input type="email" placeholder="Email" />
				<Button type="submit">Reset Password</Button>
			</form>
			<Button variant="link" asChild>
				<Link href="/login">Back to login</Link>
			</Button>
		</div>
	);
}