// Review recommendation type
export type ReviewRecommendation = "accept" | "reject";

// Submission file from API
export interface SubmissionFile {
	id: string;
	fileName: string;
	fileSize: number;
	contentType: string;
	purpose?: string | null;
}

// Submission data from API
export interface SubmissionData {
	id: string;
	title: string;
	abstract?: string | null;
	files: SubmissionFile[];
}

// Review data from API
export interface ReviewData {
	id: string;
	score: number | null;
	comment: string | null;
	recommendation: ReviewRecommendation | null;
	updatedAt: string | Date;
}

// Component props
export interface ReviewProps {
	eventId: string;
	submissionId: string;
}

// Review form state
export interface ReviewFormState {
	rating: number | null;
	comments: string;
	isReadOnly: boolean;
}
