"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Props {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
}

export const QuestionField = ({
    value,
    onChange,
    onSubmit,
}: Props) => {
    return (
        <>
            <div className="mb-10 text-center">
                <h1 className="text-3xl font-bold mb-2">
                    Ask the Speaker
                </h1>
                <p className="text-muted-foreground">
                    Submit your questions and vote for the ones you want answered.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Ask a Question</CardTitle>
                    <CardDescription>
                        What's on your mind?
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Type your question here..."
                        className="min-h-[100px]"
                    />
                </CardContent>

                <CardFooter className="justify-end">
                    <Button onClick={onSubmit}>
                        Submit Question
                    </Button>
                </CardFooter>
            </Card>
        </>
    );
};
