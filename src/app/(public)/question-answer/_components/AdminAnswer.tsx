"use client";


import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Props {
    value: string;
    onChange: (value: string) => void;
    onSubmit: (id: string) => void;
    id: string;
}

export const AdminAnswer = ({
    value,
    onChange,
    onSubmit,
    id,
}: Props) => {
    return (
        <div className="w-full mt-4 space-y-4 border-t pt-4">
            <div className="space-y-2">
                <p className="text-sm font-medium">Your Answer</p>
                <Textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Type your answer here..."
                    className="min-h-[100px]"
                />
            </div>

            <div className="flex justify-end">
                <Button onClick={() => onSubmit(id)}>
                    Submit Answer
                </Button>
            </div>
        </div>
    );
};
