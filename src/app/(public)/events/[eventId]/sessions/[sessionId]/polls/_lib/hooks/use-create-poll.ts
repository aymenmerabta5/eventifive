"use client";

import { useMutation } from "@tanstack/react-query";
import { client } from "@/utils/orpc";
import type { PollType } from "../types";
import { toast } from "sonner";

interface CreatePollParams {
  sessionId: string;
  question: string;
  pollType: PollType;
  options: string[];
}

export function useCreatePoll() {
  return useMutation({
    mutationFn: async (params: CreatePollParams) => {
      const response = await client.websocketsRouter.polls.create({
        sessionId: params.sessionId,
        question: params.question,
        pollType: params.pollType,
        options: params.options,
      });
      return response;
    },
    onSuccess: () => {
      toast.success("Poll created successfully!");
    },
    onError: () => {
      toast.error("Failed to create poll. Please try again.");
    },
  });
}
