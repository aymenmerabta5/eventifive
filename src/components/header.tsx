"use client";
import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";
import Logo from "@/components/logo";

export default function Header() {
	const links = [
		{ to: "/", label: "Home" },
		{ to: "/dashboard", label: "Dashboard" },
	] as const;

	return (
		<header className="border-b bg-background">
			<div className="container mx-auto px-4 py-4 flex items-center justify-between">
				<nav className="flex items-center gap-8 text-lg">
					<Logo />
					{links.map(({ to, label }) => {
						return (
							<Link key={to} href={to} className="text-muted-foreground transition-colors hover:text-foreground">
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
