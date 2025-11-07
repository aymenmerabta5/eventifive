"use client";

import SignInForm from "@/app/(auth)/login/_components/sign-in-form";
import SignUpForm from "@/app/(auth)/login/_components/sign-up-form";
import { useState } from "react";
import ReturnBack from "@/components/return-back";

export default function LoginPage() {
	const [showSignIn, setShowSignIn] = useState<boolean>(true);

	return showSignIn ? (
		<>
			<ReturnBack />
			<SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
		</>
	) : (
		<>
			<ReturnBack />
			<SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
		</>
	);
}
