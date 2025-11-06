"use client";

import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
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
