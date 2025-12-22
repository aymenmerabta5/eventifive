"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ThumbsUp,
  MessageSquare,
  Trash2,
  CheckCircle,
  Clock,
  Loader2,
  Send,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { QA_QUERY_KEY } from "../_lib";

type AnswerRole = "organizer" | "chair" | "committee" | "speaker";

interface Answer {
  id: string;
  userId: string;
  userName: string;
  userImage: string | null;
  content: string;
  role: AnswerRole;
  createdAt: Date;
}

const roleBadgeConfig: Record<AnswerRole, { label: string; className: string }> = {
  organizer: {
    label: "Organizer",
    className: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  },
  chair: {
    label: "Chair",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  },
  committee: {
    label: "Committee",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  },
  speaker: {
    label: "Speaker",
    className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  },
};

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

interface QuestionCardProps {
  question: Question;
  isSessionManager: boolean;
  currentUserId: string;
}

const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

export function QuestionCard({
  question,
  isSessionManager,
  currentUserId,
}: QuestionCardProps) {
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [answerContent, setAnswerContent] = useState("");
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: () => orpc.websocketsRouter.qa.like.call({ questionId: question.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QA_QUERY_KEY(question.sessionId) });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to like question");
    },
  });

  const answerMutation = useMutation({
    mutationFn: (content: string) =>
      orpc.websocketsRouter.qa.answer.call({ questionId: question.id, content }),
    onSuccess: () => {
      setAnswerContent("");
      setShowAnswerForm(false);
      queryClient.invalidateQueries({ queryKey: QA_QUERY_KEY(question.sessionId) });
      toast.success("Answer submitted!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit answer");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => orpc.websocketsRouter.qa.delete.call({ questionId: question.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QA_QUERY_KEY(question.sessionId) });
      toast.success("Question deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete question");
    },
  });

  const approveMutation = useMutation({
    mutationFn: (approved: boolean) =>
      orpc.websocketsRouter.qa.approve.call({ questionId: question.id, approved }),
    onSuccess: (_, approved) => {
      queryClient.invalidateQueries({ queryKey: QA_QUERY_KEY(question.sessionId) });
      toast.success(approved ? "Question approved" : "Question rejected");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update question");
    },
  });

  const canDelete = isSessionManager || question.userId === currentUserId;
  const canAnswer = isSessionManager && question.isApproved;
  const canApprove = isSessionManager && !question.isApproved;

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        !question.isApproved && "border-dashed opacity-75",
        question.isAnswered && "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20",
      )}
    >
      {/* Question Header */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            {!question.isAnonymous && question.userImage && (
              <AvatarImage src={question.userImage} />
            )}
            <AvatarFallback className={question.isAnonymous ? "bg-muted text-muted-foreground" : ""}>
              {question.isAnonymous ? "A" : question.userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{question.userName}</p>
            <p className="text-muted-foreground text-xs">
              {formatRelativeTime(question.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!question.isApproved && (
            <Badge variant="outline" className="text-xs">
              <Clock className="mr-1 h-3 w-3" />
              Pending
            </Badge>
          )}
          {question.isAnswered && (
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
            >
              <CheckCircle className="mr-1 h-3 w-3" />
              Answered
            </Badge>
          )}
        </div>
      </div>

      {/* Question Content */}
      <p className="mb-4 whitespace-pre-wrap">{question.content}</p>

      {/* Answers */}
      {question.answers.length > 0 && (
        <div className="border-primary/20 bg-primary/5 mb-4 space-y-3 rounded-lg border-l-4 p-3">
          {question.answers.map((answer) => {
            const badgeConfig = roleBadgeConfig[answer.role];
            return (
              <div key={answer.id} className="flex gap-3">
                <Avatar className="h-6 w-6">
                  {answer.userImage && <AvatarImage src={answer.userImage} />}
                  <AvatarFallback>
                    {answer.userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{answer.userName}</span>
                    <Badge variant="secondary" className={cn("text-xs", badgeConfig.className)}>
                      {badgeConfig.label}
                    </Badge>
                    <span className="text-muted-foreground text-xs">
                      {formatRelativeTime(answer.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{answer.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Answer Form */}
      {showAnswerForm && canAnswer && (
        <div className="mb-4 space-y-2">
          <Textarea
            placeholder="Type your answer..."
            value={answerContent}
            onChange={(e) => setAnswerContent(e.target.value)}
            maxLength={2000}
            rows={3}
            className="resize-none"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowAnswerForm(false);
                setAnswerContent("");
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => answerMutation.mutate(answerContent)}
              disabled={!answerContent.trim() || answerMutation.isPending}
            >
              {answerMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Submit Answer
            </Button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={question.hasLiked ? "secondary" : "ghost"}
          size="sm"
          onClick={() => likeMutation.mutate()}
          disabled={likeMutation.isPending || !question.isApproved}
          className={cn(
            question.hasLiked && "text-primary",
          )}
        >
          <ThumbsUp
            className={cn("mr-1 h-4 w-4", question.hasLiked && "fill-current")}
          />
          {question.likeCount}
        </Button>

        {canAnswer && !showAnswerForm && (
          <Button variant="ghost" size="sm" onClick={() => setShowAnswerForm(true)}>
            <MessageSquare className="mr-1 h-4 w-4" />
            Answer
          </Button>
        )}

        {canApprove && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => approveMutation.mutate(true)}
              disabled={approveMutation.isPending}
              className="text-green-600 hover:text-green-700"
            >
              <CheckCircle className="mr-1 h-4 w-4" />
              Approve
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => approveMutation.mutate(false)}
              disabled={approveMutation.isPending}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Reject
            </Button>
          </>
        )}

        {canDelete && question.isApproved && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
