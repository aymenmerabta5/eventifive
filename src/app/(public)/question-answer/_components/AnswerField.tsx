"use client";

import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp } from "lucide-react";
import type { Question } from "../page";

interface Props {
    questions: Question[];
    onLike: (id: string) => void;
}

export const AnswerField = ({ questions, onLike }: Props) => {
    const sortedQuestions = [...questions].sort(
        (a, b) => b.likes - a.likes
    );

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">
                Popular Questions
            </h2>

            {sortedQuestions.map((question) => (
                <Card key={question.id}>
                    <CardContent className="pt-6 flex gap-4">
                        <div className="flex-1">
                            <p className="text-lg leading-relaxed">
                                {question.text}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                                {question.timestamp.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </p>
                        </div>

                        <div className="flex flex-col items-center gap-1">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => onLike(question.id)}
                                className="rounded-full h-10 w-10 hover:bg-primary/10 hover:text-primary"
                            >
                                <ThumbsUp className="h-4 w-4" />
                            </Button>
                            <span className="text-sm font-medium text-muted-foreground">
                                {question.likes}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            ))}

            {sortedQuestions.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    No questions yet. Be the first to ask!
                </div>
            )}
        </div>
    );
};
