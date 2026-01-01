export type AnswerRole = "organizer" | "chair" | "communicator" | "speaker";

export interface Answer {
  id: string;
  userId: string;
  userName: string;
  userImage: string | null;
  content: string;
  role: AnswerRole;
  createdAt: Date;
}

export interface Question {
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

// Real-time event types
export interface QuestionEvent {
  type: "question_created" | "question_updated" | "question_deleted";
  question: {
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
    createdAt: Date;
  };
}

export interface LikeEvent {
  type: "question_liked" | "question_unliked";
  questionId: string;
  likeCount: number;
  userId: string;
}

export interface AnswerEvent {
  type: "answer_created" | "answer_updated" | "answer_deleted";
  answer: {
    id: string;
    questionId: string;
    userId: string;
    userName: string;
    userImage: string | null;
    content: string;
    role: AnswerRole;
    createdAt: Date;
  };
}

export type SessionQAEvent = QuestionEvent | LikeEvent | AnswerEvent;
