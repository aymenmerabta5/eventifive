"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";
import { toast } from "sonner";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
	FileText,
	Download,
	CheckCircle2,
	XCircle,
	Loader2,
	AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewPageProps {
	eventId: string;
	submissionId: string;
}

type ReviewRecommendation = "accept" | "reject";

export default function ReviewPage({ eventId, submissionId }: ReviewPageProps) {
	const { data: session, isPending: isSessionPending } = authClient.useSession();
	const user = session?.user;

	const [recommendation, setRecommendation] = useState<ReviewRecommendation | undefined>(undefined);
	const [comments, setComments] = useState("");
	const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);
	const {
		data: submission,
		isLoading,
		error: submissionError,
	} = useQuery({
		...orpc.submissions.get.queryOptions({
			input: { id: submissionId },
		}),
		enabled: !!user, 
		retry: false, 
	});

	const errorMessage = submissionError
		? submissionError.message?.includes("FORBIDDEN") || submissionError.message?.includes("permission")
			? "You do not have permission to access this submission. Please ensure you are assigned as a reviewer."
			: submissionError.message?.includes("NOT_FOUND") || submissionError.message?.includes("not found")
			? "The submission you're looking for doesn't exist. Please check the submission ID."
			: "Failed to load submission details. Please try again."
		: null;

	const downloadFileMutation = useMutation({
		mutationFn: async ({ fileId, fileName }: { fileId: string; fileName: string }) => {
			const { downloadUrl } = await orpc.files.getDownloadUrl.call({ fileId });
			
			const link = document.createElement("a");
			link.href = downloadUrl;
			link.download = fileName;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			
			return { downloadUrl, fileName };
		},
		onSuccess: () => {
			toast.success("File download started");
		},
		onError: (error) => {
			console.error("Error downloading file:", error);
			toast.error("Failed to download file");
		},
	});

	const handleDownload = async (fileId: string, fileName: string) => {
		setDownloadingFileId(fileId);
		downloadFileMutation.mutate({ fileId, fileName }, {
			onSettled: () => setDownloadingFileId(null),
		});
	};
	const submitReviewMutation = useMutation(
		orpc.reviews.create.mutationOptions({
			onSuccess: () => {
				toast.success("Review submitted successfully");
				setComments("");
				setRecommendation(undefined);
			},
			onError: (error) => {
				console.error("Error submitting review:", error);
				toast.error(
					error instanceof Error
						? error.message
						: "Failed to submit review. Please try again.",
				);
			},
		})
	);

	const handleSubmitReview = () => {
		if (!recommendation) {
			toast.error("Please provide a recommendation for this submission");
			return;
		}

		if (!user) {
			toast.error("You must be logged in to submit a review");
			return;
		}

		submitReviewMutation.mutate({
			submissionId,
			recommendation,
			comment: comments.trim() || undefined,
		});
	};

	if (isSessionPending || isLoading) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center px-4">
				<Card className="w-full max-w-4xl">
					<CardHeader>
						<Skeleton className="h-8 w-64" />
						<Skeleton className="h-4 w-96" />
					</CardHeader>
					<CardContent className="space-y-6">
						<Skeleton className="h-20 w-full" />
						<Skeleton className="h-32 w-full" />
						<Skeleton className="h-40 w-full" />
					</CardContent>
				</Card>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center px-4">
				<Card className="w-full max-w-4xl">
					<CardContent className="flex flex-col items-center justify-center py-12">
						<AlertCircle className="mb-4 h-12 w-12 text-destructive" />
						<h2 className="mb-2 text-xl font-semibold">Authentication Required</h2>
						<p className="text-muted-foreground">
							You must be logged in to review submissions.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}
	if (!isLoading && !submission) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center px-4">
				<Card className="w-full max-w-4xl">
					<CardContent className="flex flex-col items-center justify-center py-12">
						<AlertCircle className="mb-4 h-12 w-12 text-destructive" />
						<h2 className="mb-2 text-xl font-semibold">Submission Not Found</h2>
						<p className="text-center text-muted-foreground">
							{errorMessage || "The submission you're looking for doesn't exist or you don't have access to it."}
						</p>
						{submissionId && (
							<p className="mt-4 text-xs text-muted-foreground">
								Submission ID: {submissionId}
							</p>
						)}
					</CardContent>
				</Card>
			</div>
		);
	}
	if (!submission) {
		return null;
	}

	const recommendationOptions: {
		value: ReviewRecommendation;
		label: string;
		variant: "default" | "secondary" | "destructive" | "outline";
		icon: typeof CheckCircle2;
	}[] = [
		{
			value: "accept",
			label: "Accept",
			variant: "default",
			icon: CheckCircle2,
		},
		{
			value: "reject",
			label: "Reject",
			variant: "destructive",
			icon: XCircle,
		},
	];

	return (
		<div className="flex min-h-[60vh] items-center justify-center px-4 py-10">
			<div className="w-full max-w-4xl space-y-8">
				{/* Header Section */}
				<div className="space-y-4 text-center">
					<Badge variant="secondary" className="px-4 py-1.5">
						<FileText className="mr-2 h-3.5 w-3.5" />
						Review Submission
					</Badge>
					<h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
						Review Submission
					</h1>
					<p className="mx-auto max-w-xl text-balance text-muted-foreground">
						Review the submission details and provide your recommendation.
					</p>
				</div>

				{/* Submission Details Card */}
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
							<p className="text-lg font-semibold">{submission.title}</p>
						</div>

						{submission.abstract && (
							<div className="space-y-2">
								<Label className="text-sm font-medium text-muted-foreground">
									Abstract
								</Label>
								<p className="text-sm leading-relaxed text-muted-foreground">
									{submission.abstract}
								</p>
							</div>
						)}

						<Separator />

						{/* Files Section */}
						<div className="space-y-3">
							<Label className="text-sm font-medium">Files</Label>
							{submission.files && submission.files.length > 0 ? (
								<div className="space-y-3">
									{submission.files.map((file) => (
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
														onClick={() => handleDownload(file.id, file.fileName)}
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

				{/* General Comments Card */}
				<Card>
					<CardHeader>
						<CardTitle>General Comments</CardTitle>
						<CardDescription>
							Provide overall feedback about the submission (optional)
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Recommendation Section */}
						<div className="space-y-3">
							<Label className="text-sm font-medium">
								Recommendation *
							</Label>
							<div className="grid gap-2 sm:grid-cols-2">
								{recommendationOptions.map((option) => {
									const Icon = option.icon;
									const isSelected = recommendation === option.value;
									return (
										<Button
											key={option.value}
											type="button"
											variant={isSelected ? option.variant : "outline"}
											size="sm"
											className={cn(
												"h-auto flex-col gap-1.5 p-3 text-xs",
												isSelected && "ring-2 ring-ring",
											)}
											onClick={() => setRecommendation(option.value)}
										>
											<Icon className="h-4 w-4" />
											<span>{option.label}</span>
										</Button>
									);
								})}
							</div>
							{recommendation && (
								<div className="rounded-lg bg-muted/50 p-3">
									<p className="text-sm text-muted-foreground">
										You have selected to <strong>{recommendation === "accept" ? "accept" : "reject"}</strong> this submission.
									</p>
								</div>
							)}
						</div>

						<Separator />

						{/* Comments Section */}
						<div className="space-y-2">
							<Label htmlFor="comments" className="text-sm font-medium">
								Overall Comments
							</Label>
							<Textarea
								id="comments"
								placeholder="Share your overall thoughts, suggestions, or concerns about this submission..."
								value={comments}
								onChange={(e) => setComments(e.target.value)}
								rows={6}
								className="resize-none"
							/>
							<p className="text-xs text-muted-foreground">
								This section is for general feedback about the submission.
							</p>
						</div>
					</CardContent>
					<CardFooter className="flex-col gap-4 sm:flex-row sm:justify-between">
						<p className="text-xs text-muted-foreground">
							Please review all files above before submitting. Your review will be
							saved and can be updated later.
						</p>
						<Button
							type="button"
							onClick={handleSubmitReview}
							disabled={
								submitReviewMutation.isPending || !recommendation
							}
							className="w-full sm:w-auto sm:min-w-[200px]"
						>
							{submitReviewMutation.isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Submitting...
								</>
							) : (
								<>
									<CheckCircle2 className="mr-2 h-4 w-4" />
									Submit Review
								</>
							)}
						</Button>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}
