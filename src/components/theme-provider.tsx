"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Suspense } from "react";
import Loader from "./loader";

export function ThemeProviderComponent({
	children,
	...props
}: React.ComponentProps<typeof NextThemesProvider>) {
	return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

export default function ThemeProvider({ children, ...props }: React.ComponentProps<typeof ThemeProviderComponent>) {
	return (
		<Suspense fallback={<Loader />}>
			<ThemeProviderComponent {...props}>{children}</ThemeProviderComponent>
		</Suspense>
	);
}
