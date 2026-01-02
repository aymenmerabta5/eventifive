"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Send, Loader2, MessageSquareText } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { toast } from "sonner";
import { QA_QUERY_KEY } from "../_lib";

interface QuestionFormProps {
  sessionId: string;
  qaEnabled: boolean;
  qaModerated: boolean;
  isSessionManager: boolean;
}

export function QuestionForm({
  sessionId,
  qaEnabled,
  qaModerated,
  isSessionManager,
}: QuestionFormProps) {
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const queryClient = useQueryClient();

  const askMutation = useMutation({
    mutationFn: (data: { content: string; isAnonymous: boolean }) =>
      orpc.websocketsRouter.qa.ask.call({
        sessionId,
        content: data.content,
        isAnonymous: data.isAnonymous,
      }),
    onSuccess: () => {
      setContent("");
      setIsAnonymous(false);
      queryClient.invalidateQueries({
        queryKey: QA_QUERY_KEY(sessionId),
      });
      if (qaModerated) {
        toast.success(
          "Question submitted! It will appear after moderator approval.",
        );
      } else {
        toast.success("Question submitted!");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit question");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    askMutation.mutate({ content: content.trim(), isAnonymous });
  };

  if (!qaEnabled) {
    return (
      <div className="bg-muted/50 mb-6 rounded-lg p-4 text-center">
        <p className="text-muted-foreground">
          Q&A is not enabled for this session
        </p>
      </div>
    );
  }

  // Session managers (organizer, chair, communicator, speaker) can only answer, not ask
  if (isSessionManager) {
    return (
      <div className="bg-primary/5 border-primary/20 mb-6 rounded-lg border p-4">
        <div className="flex items-center gap-3">
          <MessageSquareText className="text-primary h-5 w-5" />
          <div>
            <p className="font-medium">Session Host Mode</p>
            <p className="text-muted-foreground text-sm">
              As a session host, you can answer and moderate questions from
              participants.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="question">Your Question</Label>
        <Textarea
          id="question"
          placeholder="Type your question here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={1000}
          rows={3}
          className="resize-none"
        />
        <p className="text-muted-foreground text-xs">
          {content.length}/1000 characters
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="anonymous"
            checked={isAnonymous}
            onCheckedChange={(checked) => setIsAnonymous(checked === true)}
          />
          <Label htmlFor="anonymous" className="text-sm font-normal">
            Ask anonymously
          </Label>
        </div>

        <Button
          type="submit"
          disabled={!content.trim() || askMutation.isPending}
        >
          {askMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          Submit Question
        </Button>
      </div>
    </form>
  );
}
