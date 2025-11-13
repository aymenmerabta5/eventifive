"use client";

import SignInForm from "@/app/(auth)/login/_components/sign-in-form";
import SignUpForm from "@/app/(auth)/login/_components/sign-up-form";
import { useState, Suspense } from "react";
import ReturnBack from "@/components/return-back";
import Loader from "@/components/loader";

export default function LoginPage() {
	const [showSignIn, setShowSignIn] = useState<boolean>(true);

	return showSignIn ? (
		<>
			<ReturnBack />
			<Suspense fallback={<Loader />}>
				<SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
			</Suspense>
		</>
	) : (
		<>
			<ReturnBack />
			<Suspense fallback={<Loader />}>
				<SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
			</Suspense>
		</>
	);
}
