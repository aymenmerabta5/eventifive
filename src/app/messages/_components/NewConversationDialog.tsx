"use client";

import { useState } from "react";
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { useCreateConversation } from "../_lib/hooks";
import { toast } from "sonner";

interface NewConversationDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConversationCreated: (conversationId: string) => void;
}

export function NewConversationDialog({
	open,
	onOpenChange,
	onConversationCreated,
}: NewConversationDialogProps) {
	const [userId, setUserId] = useState("");
	const createConversation = useCreateConversation();

	const handleCreateConversation = async () => {
		if (!userId.trim()) {
			toast.error("Please enter a user ID");
			return;
		}

		try {
			const result = await createConversation.mutateAsync(userId.trim());
			toast.success(
				result.isNew ? "Conversation created" : "Conversation found"
			);
			setUserId("");
			onConversationCreated(result.id);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to create conversation"
			);
		}
	};

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent>
				<div className="mx-auto w-full max-w-md">
					<DrawerHeader>
						<DrawerTitle>New Conversation</DrawerTitle>
					</DrawerHeader>

					<div className="space-y-4 p-4">
						<div className="space-y-2">
							<label className="text-sm font-medium text-foreground">
								User ID
							</label>
							<div className="relative">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
								<Input
									placeholder="Enter user ID to start conversation..."
									value={userId}
									onChange={(e) => setUserId(e.target.value)}
									className="pl-9"
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											handleCreateConversation();
										}
									}}
								/>
							</div>
							<p className="text-xs text-muted-foreground">
								Enter the ID of the user you want to message
							</p>
						</div>

						<Button
							onClick={handleCreateConversation}
							disabled={!userId.trim() || createConversation.isPending}
							className="w-full"
						>
							{createConversation.isPending ? (
								<>
									<Loader2 className="size-4 mr-2 animate-spin" />
									Starting...
								</>
							) : (
								"Start Conversation"
							)}
						</Button>
					</div>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
