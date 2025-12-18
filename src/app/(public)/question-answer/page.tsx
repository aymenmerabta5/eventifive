"use client";

import { useState } from "react";
import { toast } from "sonner";
import { QuestionField } from "./_components/QuestionField";
import { AnswerField } from "./_components/AnswerField";
import { AdminAnswer } from "./_components/Admen-answer";

export interface Question {
    id: string;
    text: string;
    answer: string | null;
    likes: number;
    timestamp: Date;
}

const EXAMPLE_QUESTIONS: Question[] = [
    {
        id: "1",
        text: "What was the biggest challenge in scaling the architecture?",
        answer: null,
        likes: 14,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
        id: "2",
        text: "Will this event be recorded and available later?",
        answer: null,
        likes: 15,
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
        id: "3",
        text: "What tech stack do you recommend for beginners in 2024?",
        answer: null,
        likes: 16,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    },
];

export default function QuestionAnswerPage() {
    const [questions, setQuestions] =
        useState<Question[]>(EXAMPLE_QUESTIONS);
    const [newQuestion, setNewQuestion] = useState("");
    const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
    const [answerText, setAnswerText] = useState("");

    const handleSubmit = () => {
        if (!newQuestion.trim()) {
            toast.error("Please enter a question");
            return;
        }

        const question: Question = {
            id: crypto.randomUUID(),
            text: newQuestion,
            answer: null,
            likes: 0,
            timestamp: new Date(),
        };

        setQuestions((prev) => [question, ...prev]);
        setNewQuestion("");
        toast.success("Question submitted!");
    };

    const handleLike = (id: string) => {
        setQuestions((prev) =>
            prev.map((q) =>
                q.id === id ? { ...q, likes: q.likes + 1 } : q
            )
        );
    };

    const handleSelectQuestion = (id: string) => {
        if (selectedQuestionId === id) {
            setSelectedQuestionId(null); // Toggle off
        } else {
            setSelectedQuestionId(id);
        }
        setAnswerText("");
    };

    const handleSubmitAnswer = (id: string) => {
        if (!answerText.trim()) {
            toast.error("Please enter an answer");
            return;
        }
        setQuestions((prev) =>
            prev.map((q) =>
                q.id === id ? { ...q, answer: answerText } : q
            )
        );

        toast.success("Answer submitted!");
        setSelectedQuestionId(null);
        setAnswerText("");
    };
    const handleDeleteQuestion = (id: string) => {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
        toast.success("Question deleted!");
    };

    return (
        <div className="container mx-auto max-w-2xl py-12 px-4 space-y-10">
            <QuestionField
                value={newQuestion}
                onChange={setNewQuestion}
                onSubmit={handleSubmit}
            />

            <AnswerField
                questions={questions}
                onLike={handleLike}
                selectedQuestionId={selectedQuestionId}
                onSelectQuestion={handleSelectQuestion}
                answerValue={answerText}
                onAnswerChange={setAnswerText}
                onAnswerSubmit={handleSubmitAnswer}
                onDeleteQuestion={handleDeleteQuestion}
            />
        </div>
    );
}
