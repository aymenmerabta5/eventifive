"use client";
import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";
import Logo from "@/components/logo";
import { authClient } from "@/lib/auth-client";
import { useMemo, useState } from "react";
import { useScroll, useMotionValueEvent, motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import type { Route } from "next";
import { MessageCircle } from "lucide-react";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export default function Header() {
	const { data: session } = authClient.useSession();
	const links = useMemo(() => [
		{ to: "/dashboard", label: "Dashboard", isPublic: false } as const,
		{ to: "/pricing", label: "Pricing", isPublic: true } as const,
	], []);
	const { scrollY } = useScroll();
	const [isScrolled, setIsScrolled] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
				{/* Desktop Navigation */}
				<nav className="hidden md:flex items-center gap-8 text-lg">
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

				{/* Mobile Logo */}
				<motion.div
					className="md:hidden"
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
				>
					<Logo />
				</motion.div>

				{/* Desktop Right Section */}
				<motion.div
					className="hidden md:flex items-center gap-3"
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

				{/* Mobile Menu */}
				<div className="flex md:hidden items-center gap-2">
					<Link href={"/messages" as Route} className="rounded-full p-2.5 cursor-pointer text-muted-foreground transition-colors bg-muted/50 hover:bg-muted/70">
						<MessageCircle className="size-4" />
					</Link>
					<Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
						<SheetTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="relative size-10"
								aria-label="Toggle menu"
							>
								<div className="flex flex-col justify-center items-center">
									<motion.span
										className="absolute h-0.5 w-5 bg-current rounded-full"
										animate={{
											rotate: mobileMenuOpen ? 45 : 0,
											y: mobileMenuOpen ? 0 : -4,
										}}
										transition={{ duration: 0.2, ease: "easeInOut" }}
									/>
									<motion.span
										className="absolute h-0.5 w-5 bg-current rounded-full"
										animate={{
											opacity: mobileMenuOpen ? 0 : 1,
											scaleX: mobileMenuOpen ? 0 : 1,
										}}
										transition={{ duration: 0.2, ease: "easeInOut" }}
									/>
									<motion.span
										className="absolute h-0.5 w-5 bg-current rounded-full"
										animate={{
											rotate: mobileMenuOpen ? -45 : 0,
											y: mobileMenuOpen ? 0 : 4,
										}}
										transition={{ duration: 0.2, ease: "easeInOut" }}
									/>
								</div>
							</Button>
						</SheetTrigger>
						<SheetContent side="right" className="w-full h-full bg-background/95 backdrop-blur-xl border-none p-0">
							<div className="flex flex-col h-full">
								<SheetHeader className="p-6 pb-0">
									<SheetTitle className="text-left sr-only">Menu</SheetTitle>
									<div className="flex justify-between items-center">
										<Logo />
										{/* Close button is handled by SheetPrimitive, but we can add a custom one or rely on the default top-right X */}
									</div>
								</SheetHeader>
								<nav className="flex-1 flex flex-col justify-center items-center gap-8 p-6">
									<AnimatePresence>
										{mobileMenuOpen && (
											<>
												{filteredLinks.map(({ to, label }, index) => (
													<motion.div
														key={to}
														initial={{ opacity: 0, y: 20 }}
														animate={{ opacity: 1, y: 0 }}
														exit={{ opacity: 0, y: 20 }}
														transition={{
															duration: 0.4,
															delay: index * 0.1,
															ease: [0.22, 1, 0.36, 1],
														}}
													>
														<Link
															href={to as Route}
															onClick={() => setMobileMenuOpen(false)}
															className="relative group text-4xl font-bold tracking-tight text-foreground/80 hover:text-foreground transition-colors"
														>
															<span className="relative z-10">{label}</span>
															<motion.span
																className="absolute -bottom-2 left-0 w-0 h-1 bg-primary rounded-full group-hover:w-full transition-all duration-300 ease-out"
															/>
														</Link>
													</motion.div>
												))}
												
												<motion.div
													initial={{ opacity: 0, y: 20 }}
													animate={{ opacity: 1, y: 0 }}
													exit={{ opacity: 0, y: 20 }}
													transition={{
														duration: 0.4,
														delay: filteredLinks.length * 0.1,
														ease: "easeOut",
													}}
													className="flex items-center gap-6 mt-8"
												>
													<ModeToggle />
													<UserMenu />
												</motion.div>
											</>
										)}
									</AnimatePresence>
								</nav>
								
								<div className="p-6 text-center text-sm text-muted-foreground">
									© {new Date().getFullYear()} Eventifive. All rights reserved.
								</div>
							</div>
						</SheetContent>
					</Sheet>
				</div>
			</div>
		</motion.header>
	);
}
