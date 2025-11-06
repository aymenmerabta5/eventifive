"use client";
import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";
import Logo from "@/components/logo";
import { authClient } from "@/lib/auth-client";
import { useMemo } from "react";

export default function Header() {
	const { data: session } = authClient.useSession();
	const links = useMemo(() => [
		{ to: "/dashboard", label: "Dashboard", isPublic: false }
	], []);

    const filteredLinks = useMemo(() => links.filter(({ isPublic }) => isPublic ? true : session?.user), [links, session]);
	return (
		<header className="relative z-50 border-b bg-background">
			<div className="container mx-auto px-4 py-4 flex items-center justify-between">
				<nav className="flex items-center gap-8 text-lg">
					<Logo />
					{filteredLinks.map(({ to, label }) => {
						return (
							// eslint-disable-next-line @typescript-eslint/no-explicit-any
							<Link key={to} href={to as any} className="text-muted-foreground transition-colors hover:text-foreground">
								{label}
							</Link>
						);
					})}
				</nav>
				<div className="flex items-center gap-3">
					<ModeToggle />
					<UserMenu />
				</div>
			</div>
		</header>
	);
}
