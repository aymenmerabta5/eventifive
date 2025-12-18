export interface Question {
    id: string;
    text: string;
    answer: string | null;
    likes: number;
    timestamp: Date;
}
