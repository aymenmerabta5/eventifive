import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { AdminEvent } from "../types";

interface DeleteEventDialogProps {
	event: AdminEvent | null;
	onClose: () => void;
	onConfirm: () => void;
}

export function DeleteEventDialog({ event, onClose, onConfirm }: DeleteEventDialogProps) {
	return (
		<Dialog open={!!event} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete event</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete{" "}
						<strong>{event?.title}</strong>?
						This action cannot be undone.
					</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<Button variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button variant="destructive" onClick={onConfirm}>
						Delete
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
