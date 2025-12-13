"use client";

import { motion } from "motion/react";
import { IconMicrophone, IconUsers, IconPresentation, IconUpload } from "@tabler/icons-react";
import Link from "next/link";
import type { Route } from "next";
import { useParams } from "next/navigation";

export default function ParticipationOptions() {
	const { eventType, eventId } = useParams<{ eventType: string; eventId: string }>();

	return (
		<section className="mt-16">
			<div className="mb-12">
				<h1 className="text-foreground text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl text-center">
					Join Us
				</h1>
				<p className="text-muted-foreground mt-4 text-sm font-semibold uppercase tracking-widest text-center">
					We&apos;re here to help you make your event a success
				</p>
			</div>

			
			<div className="grid gap-6 sm:grid-cols-3">
				
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="overflow-hidden rounded-lg border-2 border-border bg-card shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-primary/10 dark:hover:shadow-primary/20"
				>
					<div className="px-6 py-8 sm:px-8">
						<div className="mb-4 flex items-center gap-3">
							<div className="rounded-lg bg-primary/10 p-3">
								<IconMicrophone className="h-6 w-6 text-primary" strokeWidth={2} />
							</div>
							<h3 className="text-xl font-bold text-foreground">
								Speaker
							</h3>
						</div>
						<p className="text-muted-foreground mb-6 text-sm leading-relaxed">
							We invite experienced professionals, researchers, and industry experts who can share valuable insights, present cutting-edge research, and deliver engaging presentations that inspire and educate our audience.
						</p>
						<button className="w-full rounded-lg border-2 border-border bg-background px-6 py-3 text-sm font-semibold uppercase tracking-wider text-foreground shadow-sm transition-all hover:border-primary hover:bg-primary/10 hover:text-primary hover:shadow-md">
							Apply as Speaker
						</button>
					</div>
				</motion.div>

				
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="overflow-hidden rounded-lg border-2 border-border bg-card shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-primary/10 dark:hover:shadow-primary/20"
				>
					<div className="px-6 py-8 sm:px-8">
						<div className="mb-4 flex items-center gap-3">
							<div className="rounded-lg bg-primary/10 p-3">
								<IconPresentation className="h-6 w-6 text-primary" strokeWidth={2} />
							</div>
							<h3 className="text-xl font-bold text-foreground">
								Workshop
							</h3>
						</div>
						<p className="text-muted-foreground mb-6 text-sm leading-relaxed">
							We invite skilled facilitators and trainers who can conduct hands-on workshops, interactive sessions, and practical learning experiences that provide participants with actionable skills and knowledge.
						</p>
						<button className="w-full rounded-lg border-2 border-border bg-background px-6 py-3 text-sm font-semibold uppercase tracking-wider text-foreground shadow-sm transition-all hover:border-primary hover:bg-primary/10 hover:text-primary hover:shadow-md">
							Apply for Workshop
						</button>
					</div>
				</motion.div>

				
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
					className="overflow-hidden rounded-lg border-2 border-border bg-card shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-primary/10 dark:hover:shadow-primary/20"
				>
					<div className="px-6 py-8 sm:px-8">
						<div className="mb-4 flex items-center gap-3">
							<div className="rounded-lg bg-primary/10 p-3">
								<IconUsers className="h-6 w-6 text-primary" strokeWidth={2} />
							</div>
							<h3 className="text-xl font-bold text-foreground">
								Committer
							</h3>
						</div>
						<p className="text-muted-foreground mb-6 text-sm leading-relaxed">
							We invite dedicated professionals and leaders who can contribute to organizing committees, scientific committees, or program committees to help shape the event&apos;s content, review submissions, and ensure its success.
						</p>
						<div className="mt-10 flex justify-center">
							<Link
								href={`/events/${eventType}/${eventId}/register` as Route}
								className="inline-flex w-full max-w-xs items-center justify-center rounded-lg border-2 border-border bg-background px-6 py-3 text-sm font-semibold uppercase tracking-wider text-foreground text-center shadow-sm transition-all hover:border-primary hover:bg-primary/10 hover:text-primary hover:shadow-md"
							>
								<span>Join Committers</span>
							</Link>
						</div>
					</div>
				</motion.div>
			</div>
		</section>
	);
}