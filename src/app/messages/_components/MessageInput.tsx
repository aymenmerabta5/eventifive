"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, Smile, Send, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageInputProps {
	onSend: (content: string) => void;
	disabled?: boolean;
}

export function MessageInput({ onSend, disabled }: MessageInputProps) {
	const [message, setMessage] = useState("");
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Auto-resize textarea
	useEffect(() => {
		const textarea = textareaRef.current;
		if (textarea) {
			textarea.style.height = "auto";
			textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
		}
	}, [message]);

	const handleSubmit = () => {
		const trimmed = message.trim();
		if (trimmed && !disabled) {
			onSend(trimmed);
			setMessage("");
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		}
	};

	return (
		<div className="border-t border-border bg-card px-4 py-3">
			<div className="max-w-3xl mx-auto">
				<div className="flex items-end gap-2">
					<Button
						variant="ghost"
						size="icon"
						className="text-muted-foreground hover:text-foreground shrink-0 mb-0.5"
						disabled={disabled}
					>
						<Paperclip className="size-5" />
					</Button>

					<div className="flex-1 flex items-end gap-2 bg-muted/50 rounded-2xl border border-transparent focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] transition-all px-4 py-2">
						<textarea
							ref={textareaRef}
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder="Type a message..."
							disabled={disabled}
							rows={1}
							className={cn(
								"flex-1 bg-transparent text-sm resize-none outline-none",
								"placeholder:text-muted-foreground",
								"disabled:cursor-not-allowed disabled:opacity-50",
								"max-h-30 min-h-6"
							)}
						/>

						<Button
							variant="ghost"
							size="icon"
							className="text-muted-foreground hover:text-foreground size-8 shrink-0"
							disabled={disabled}
						>
							<Smile className="size-5" />
						</Button>
					</div>

					{message.trim() ? (
						<Button
							size="icon"
							onClick={handleSubmit}
							disabled={disabled}
							className="shrink-0 mb-0.5 rounded-full bg-primary hover:bg-primary/90"
						>
							<Send className="size-5" />
						</Button>
					) : (
						<Button
							variant="ghost"
							size="icon"
							className="text-muted-foreground hover:text-foreground shrink-0 mb-0.5"
							disabled={disabled}
						>
							<Mic className="size-5" />
						</Button>
					)}
				</div>

				<div className="h-4 mt-1">
				</div>
			</div>
		</div>
	);
}

