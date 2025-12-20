import type { ChangeEvent, DragEvent } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileUp, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ACCEPTED_FILE_TYPES_STRING, MAX_FILES } from "../constants";

interface FileUploadAreaProps {
	files: File[];
	uploadedCount: number;
	isLoadingQuota: boolean;
	isDragOver: boolean;
	canAddMoreFiles: boolean;
	maxFiles: number;
	onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onDrop: (event: DragEvent<HTMLDivElement>) => void;
	onDragOver: (event: DragEvent<HTMLDivElement>) => void;
	onDragLeave: () => void;
	onRemoveFile: (index: number) => void;
}

export function FileUploadArea({
	files,
	uploadedCount,
	isLoadingQuota,
	isDragOver,
	canAddMoreFiles,
	maxFiles,
	onFileChange,
	onDrop,
	onDragOver,
	onDragLeave,
	onRemoveFile,
}: FileUploadAreaProps) {
	return (
		<div className="space-y-3">
			<Label className="flex items-center gap-2 text-sm font-medium">
				<FileUp className="h-4 w-4 text-muted-foreground" />
				Supporting document
			</Label>
			<p className="text-xs text-muted-foreground">
				{isLoadingQuota
					? "Checking upload limit..."
					: `${uploadedCount}/${maxFiles} already uploaded for this event`}
			</p>

			{files.length === 0 ? (
				<div
					onDrop={onDrop}
					onDragOver={onDragOver}
					onDragLeave={onDragLeave}
					className={cn(
						"relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all",
						isDragOver
							? "border-primary bg-primary/5"
							: "border-border hover:border-primary/50 hover:bg-muted/30"
					)}
				>
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
						<FileUp className="h-6 w-6 text-muted-foreground" />
					</div>
					<p className="mt-4 text-sm font-medium">
						Drag and drop your file here
					</p>
					<p className="mt-1 text-xs text-muted-foreground">
						or click to browse from your computer (max {MAX_FILES} files)
					</p>
					<Input
						id="file"
						name="file"
						type="file"
						multiple
						accept={ACCEPTED_FILE_TYPES_STRING}
						onChange={onFileChange}
						className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
					/>
					<p className="mt-4 text-xs text-muted-foreground">
						PDF, DOC, DOCX up to 10MB each
					</p>
				</div>
			) : (
				<Card className="bg-muted/30">
					<CardContent className="space-y-3 p-4">
						{files.map((file, index) => (
							<div
								key={`${file.name}-${file.size}-${index}`}
								className="flex items-center gap-4"
							>
								<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
									<FileText className="h-6 w-6 text-primary" />
								</div>
								<div className="min-w-0 flex-1">
									<p className="truncate text-sm font-medium">{file.name}</p>
									<p className="text-xs text-muted-foreground">
										{(file.size / 1024 / 1024).toFixed(2)} MB
									</p>
								</div>
								<div className="flex items-center gap-2">
									<Button
										type="button"
										variant="ghost"
										size="icon"
										className="h-8 w-8 text-muted-foreground hover:text-destructive"
										onClick={() => onRemoveFile(index)}
									>
										<X className="h-4 w-4" />
									</Button>
								</div>
							</div>
						))}

						{canAddMoreFiles ? (
							<div className="relative flex items-center justify-center rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
								<span>Add more files (up to {MAX_FILES})</span>
								<Input
									id="file-more"
									name="file-more"
									type="file"
									multiple
									accept={ACCEPTED_FILE_TYPES_STRING}
									onChange={onFileChange}
									className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
								/>
							</div>
						) : null}
					</CardContent>
				</Card>
			)}
		</div>
	);
}
