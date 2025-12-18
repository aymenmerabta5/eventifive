"use client";

import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, MoreHorizontal, Pencil, Trash2, Paperclip } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Question } from "../page";
import { AdminAnswer } from "./Admen-answer";


interface Props {
    questions: Question[];
    onLike: (id: string) => void;
    selectedQuestionId: string | null;
    onSelectQuestion: (id: string) => void;
    answerValue: string;
    onAnswerChange: (value: string) => void;
    onAnswerSubmit: (id: string) => void;
    onDeleteQuestion: (id: string) => void;
}

export const AnswerField = ({
    questions,
    onLike,
    selectedQuestionId,
    onSelectQuestion,
    answerValue,
    onAnswerChange,
    onAnswerSubmit,
    onDeleteQuestion
}: Props) => {
    // const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null); // Removed local state

    const sortedQuestions = [...questions].sort(
        (a, b) => b.likes - a.likes
    );


    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">
                Popular Questions
            </h2>

            {sortedQuestions.map((question) => {
                const isSelected = selectedQuestionId === question.id;

                return (
                    <Card
                        key={question.id}
                    >
                        <CardContent className="pt-6 flex flex-col gap-4">
                            <div className="grid grid-cols-[1fr,auto] gap-4">
                                <div className="flex-1">
                                    <p className="text-lg leading-relaxed">
                                        {question.text}
                                    </p>
                                    {question.answer && (
                                        <p className="text-sm mt-2 text-muted-foreground">
                                            {question.answer}
                                        </p>
                                    )}
                                    <p className="text-xs text-muted-foreground mt-2">
                                        {question.timestamp.toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                </div>

                                <div className="flex flex-row items-center gap-1">
                                    <div className="flex flex-c items-center gap-1">
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

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuSeparator />

                                            {!question.answer && <DropdownMenuItem onClick={() => onSelectQuestion(question.id)}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                answer
                                            </DropdownMenuItem>}
                                            {question.answer && <DropdownMenuItem onClick={() => onSelectQuestion(question.id)}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                edit
                                            </DropdownMenuItem>}
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive"
                                                onClick={() => onDeleteQuestion(question.id)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {isSelected && (
                                <AdminAnswer
                                    value={answerValue}
                                    onChange={onAnswerChange}
                                    onSubmit={onAnswerSubmit}
                                    id={question.id}
                                />
                            )}
                        </CardContent>
                    </Card>
                );
            })}

            {sortedQuestions.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    No questions yet. Be the first to ask!
                </div>
            )}
        </div>
    );
};
