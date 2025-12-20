import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FileText, Download, Loader2 } from "lucide-react";
import type { SubmissionFile } from "../types";

interface SubmissionDetailsCardProps {
	title: string;
	abstract?: string | null;
	files: SubmissionFile[];
	downloadingFileId: string | null;
	onDownload: (fileId: string, fileName: string) => void;
}

export function SubmissionDetailsCard({
	title,
	abstract,
	files,
	downloadingFileId,
	onDownload,
}: SubmissionDetailsCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Submission Details</CardTitle>
				<CardDescription>Title and associated files</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="space-y-2">
					<Label className="text-sm font-medium text-muted-foreground">
						Title
					</Label>
					<p className="text-lg font-semibold">{title}</p>
				</div>

				{abstract && (
					<div className="space-y-2">
						<Label className="text-sm font-medium text-muted-foreground">
							Abstract
						</Label>
						<p className="text-sm leading-relaxed text-muted-foreground">
							{abstract}
						</p>
					</div>
				)}

				<Separator />

				<div className="space-y-3">
					<Label className="text-sm font-medium">Files</Label>
					{files.length > 0 ? (
						<div className="space-y-3">
							{files.map((file) => (
								<Card
									key={file.id}
									className="overflow-hidden bg-muted/30 transition-colors hover:bg-muted/50"
								>
									<CardContent className="flex items-center gap-4 p-4">
										<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
											<FileText className="h-6 w-6 text-primary" />
										</div>
										<div className="flex-1 min-w-0">
											<p className="truncate font-medium text-sm">
												{file.fileName}
											</p>
											<p className="text-xs text-muted-foreground">
												{(file.fileSize / 1024 / 1024).toFixed(2)} MB ·{" "}
												{file.contentType}
											</p>
											{file.purpose && (
												<Badge variant="outline" className="mt-1 text-xs">
													{file.purpose}
												</Badge>
											)}
										</div>
										<div className="flex items-center gap-2">
											<Button
												variant="outline"
												size="sm"
												onClick={() => onDownload(file.id, file.fileName)}
												disabled={downloadingFileId === file.id}
											>
												{downloadingFileId === file.id ? (
													<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												) : (
													<Download className="mr-2 h-4 w-4" />
												)}
												Download
											</Button>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					) : (
						<p className="text-sm text-muted-foreground">
							No files attached to this submission.
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
