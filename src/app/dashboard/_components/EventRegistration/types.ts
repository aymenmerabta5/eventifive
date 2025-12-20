export type ReviewStatus = "pending" | "accepted" | "rejected";
export type PaymentStatus = "unpaid" | "pending" | "paid" | "failed" | "refunded";
export type SubmissionStatus = "draft" | "accepted" | "rejected";

export type ReviewerLike = {
	reviewStatus: ReviewStatus;
} | null;

export type SubmissionFile = {
	id: string;
	fileName: string;
	fileSize: number;
	contentType: string;
	purpose: string | null;
};

export type WorkshopSubmission = {
	id: string;
	title: string;
	submitterName: string | null;
	submitterEmail: string | null;
	submittedAt: Date | null;
	fileCount: number;
	status: SubmissionStatus;
	abstract: string | null;
	keywords: string | null;
};

export type CommitteeSubmission = {
	id: string;
	title: string;
	submitterName: string | null;
	submitterEmail: string | null;
	submittedAt: Date | null;
	fileCount: number;
	status: SubmissionStatus;
	abstract: string | null;
	keywords: string | null;
	reviewers: Array<{
		reviewerName: string | null;
		reviewerEmail: string | null;
		reviewStatus: string;
		inviteStatus: string | null;
		assignedAt: Date | null;
		reviewedAt: Date | null;
	}>;
};

export type Participant = {
	id: number;
	userId: string;
	userName: string | null;
	userEmail: string;
	roleAtEvent: string;
	paymentStatus: PaymentStatus;
	registeredAt: Date;
};

export interface RegistrationStats {
	participants: {
		total: number;
		paid: number;
		unpaid: number;
		pending: number;
	};
	committee: {
		total: number;
		reviewed: number;
		pending: number;
	};
	workshop: {
		total: number;
		accepted: number;
		rejected: number;
		pending: number;
	};
}

export interface FinalDecision {
	acceptedCount: number;
	rejectedCount: number;
	pendingCount: number;
	finalStatus: ReviewStatus;
}
