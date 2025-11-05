import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "../styles/index.css";
import Providers from "@/components/providers";

const inter = Inter({
	variable: "--font-sans",
	subsets: ["latin"],
	display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
	variable: "--font-display",
	subsets: ["latin"],
	display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
	variable: "--font-mono",
	subsets: ["latin"],
	display: "swap",
});

export const metadata: Metadata = {
	title: "Eventify",
	description: "Eventify is a platform for creating and managing events",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${inter.variable} ${plusJakarta.variable} ${jetbrainsMono.variable} antialiased font-sans`}
			>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
