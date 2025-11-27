"use client";
import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";
import Logo from "@/components/logo";
import { authClient } from "@/lib/auth-client";
import { useMemo, useState } from "react";
import { useScroll, useMotionValueEvent, motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { Route } from "next";
import { MessageCircle } from "lucide-react"

export default function Header() {
	const { data: session } = authClient.useSession();
	const links = useMemo(() => [
		{ to: "/dashboard", label: "Dashboard", isPublic: false } as const,
		{ to: "/pricing", label: "Pricing", isPublic: true } as const,
	], []);
	const { scrollY } = useScroll();
	const [isScrolled, setIsScrolled] = useState(false);
	
	useMotionValueEvent(scrollY, "change", (latest) => {
		setIsScrolled(latest > 120);
	});
	
    const filteredLinks = useMemo(() => links.filter(({ isPublic }) => isPublic ? true : session?.user), [links, session]);
	return (
		<motion.header 
			className={cn(
				"sticky top-0 z-30 transition-all duration-300 py-5",
				isScrolled 
					? "bg-background/70 backdrop-blur-xl border-b border-border/50 shadow-lg shadow-black/5" 
					: "bg-transparent"
			)}
			style={isScrolled ? {
				boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
			} : {}}
			initial={{ y: -100, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ duration: 0.3, ease: "easeInOut" }}
		>
			<div className="container mx-auto px-4 flex items-center justify-between">
				<nav className="flex items-center gap-8 text-lg">
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
					>
						<Logo />
					</motion.div>
					{filteredLinks.map(({ to, label }, index) => {
						return (
							<motion.div
								key={to}
								initial={{ opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
							>
								<Link href={to as Route} className="relative after:content-[''] after:absolute after:top-8 after:left-0 after:bottom-0 after:w-full after:h-[3px] after:bg-primary after:scale-x-0 after:origin-left after:transition-transform after:duration-300 after:ease-in-out hover:after:scale-x-100">
									{label}
								</Link>
							</motion.div>
						);
					})}
				</nav>
				<motion.div 
					className="flex items-center gap-3"
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.5, delay: 0.4 }}
				>
					<Link href={"/messages" as Route} className="rounded-full p-3 cursor-pointer text-muted-foreground transition-colors bg-muted/50 hover:bg-muted/70">
						<MessageCircle className="size-5" />
					</Link>
					<ModeToggle />
					<UserMenu />
				</motion.div>
			</div>
		</motion.header>
	);
}
