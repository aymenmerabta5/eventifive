"use client";

import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
	names?: string[];
	className?: string;
}

export function TypingIndicator({ names = [], className }: TypingIndicatorProps) {
	if (names.length === 0) return null;

	const text =
		names.length === 1
			? `${names[0]} is typing`
			: names.length === 2
			? `${names[0]} and ${names[1]} are typing`
			: `${names[0]} and ${names.length - 1} others are typing`;

	return (
		<div className={cn("flex items-center gap-2 text-muted-foreground", className)}>
			<div className="flex items-center gap-0.5">
				<span
					className="size-1.5 bg-muted-foreground/60 rounded-full animate-bounce"
					style={{ animationDelay: "0ms", animationDuration: "600ms" }}
				/>
				<span
					className="size-1.5 bg-muted-foreground/60 rounded-full animate-bounce"
					style={{ animationDelay: "150ms", animationDuration: "600ms" }}
				/>
				<span
					className="size-1.5 bg-muted-foreground/60 rounded-full animate-bounce"
					style={{ animationDelay: "300ms", animationDuration: "600ms" }}
				/>
			</div>
			<span className="text-xs">{text}</span>
		</div>
	);
}

