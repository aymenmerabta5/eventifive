"use client";

import { MessageSquare } from "lucide-react";

export function EmptyState() {
	return (
		<div className="flex flex-col items-center justify-center h-full w-full bg-background">
			<div className="flex flex-col items-center text-center px-4 max-w-sm">
				<div className="relative mb-6">
					<div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl scale-150" />
					<div className="relative flex items-center justify-center size-20 bg-linear-to-br from-primary/10 to-primary/5 rounded-full border border-primary/20">
						<MessageSquare className="size-10 text-primary" />
					</div>
				</div>

				<h2 className="text-xl font-display font-semibold text-foreground mb-2">
					Welcome to Messages
				</h2>

				<p className="text-muted-foreground text-sm leading-relaxed">
					Select a conversation from the list to start chatting, or create a new
					message to connect with someone.
				</p>

				<div className="flex items-center gap-1.5 mt-6">
					<span className="size-1.5 rounded-full bg-primary/60" />
					<span className="size-1.5 rounded-full bg-primary/40" />
					<span className="size-1.5 rounded-full bg-primary/20" />
				</div>
			</div>
		</div>
	);
}

