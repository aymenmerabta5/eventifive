"use client";

import { QuestionCard } from "./QuestionCard";
import { MessageCircle } from "lucide-react";

interface Answer {
  id: string;
  userId: string;
  userName: string;
  userImage: string | null;
  content: string;
  role: "organizer" | "chair" | "committee" | "speaker";
  createdAt: Date;
}

interface Question {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  userImage: string | null;
  content: string;
  isAnonymous: boolean;
  isApproved: boolean;
  isAnswered: boolean;
  likeCount: number;
  hasLiked: boolean;
  createdAt: Date;
  answers: Answer[];
}

interface QuestionListProps {
  questions: Question[];
  isSessionManager: boolean;
  currentUserId: string;
}

export function QuestionList({
  questions,
  isSessionManager,
  currentUserId,
}: QuestionListProps) {
  if (questions.length === 0) {
    return (
      <div className="py-12 text-center">
        <MessageCircle className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
        <h3 className="text-lg font-semibold">No Questions Yet</h3>
        <p className="text-muted-foreground">
          Be the first to ask a question in this session!
        </p>
      </div>
    );
  }

  // Sort: unapproved first (for moderators), then by likes
  const sortedQuestions = [...questions].sort((a, b) => {
    // Pending questions first for moderators
    if (isSessionManager) {
      if (!a.isApproved && b.isApproved) return -1;
      if (a.isApproved && !b.isApproved) return 1;
    }
    // Then by like count
    return b.likeCount - a.likeCount;
  });

  const pendingCount = questions.filter((q) => !q.isApproved).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Questions ({questions.filter((q) => q.isApproved).length})
        </h2>
        {isSessionManager && pendingCount > 0 && (
          <span className="text-muted-foreground text-sm">
            {pendingCount} pending approval
          </span>
        )}
      </div>

      <div className="space-y-4">
        {sortedQuestions.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            isSessionManager={isSessionManager}
            currentUserId={currentUserId}
          />
        ))}
      </div>
    </div>
  );
}
