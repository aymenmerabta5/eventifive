"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/utils/orpc";
import dynamic from "next/dynamic";
import { Toaster } from "./ui/sonner";
import { TooltipProvider } from "./ui/tooltip";

const ThemeProvider = dynamic(() => import("./theme-provider").then(mod => ({ default: mod.default })), {
	ssr: false,
});

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			<QueryClientProvider client={queryClient}>
				<TooltipProvider>
					{children}
					<ReactQueryDevtools />
				</TooltipProvider>
			</QueryClientProvider>
			<Toaster richColors />
		</ThemeProvider>
	);
}
