import { publisher, createSubscriber } from "./redis";

// Redis channel patterns for session Q&A
function getSessionQAChannel(sessionId: string): string {
  return `session:${sessionId}:qa`;
}

// Event types for Q&A
export type QAEventType =
  | "question_created"
  | "question_updated"
  | "question_deleted"
  | "question_liked"
  | "question_unliked"
  | "answer_created"
  | "answer_updated"
  | "answer_deleted";

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
    role: "organizer" | "chair" | "committee" | "speaker";
    createdAt: Date;
  };
}

export type SessionQAEvent = QuestionEvent | LikeEvent | AnswerEvent;

// Publish a Q&A event to a session channel
export async function publishSessionQAEvent(
  sessionId: string,
  event: SessionQAEvent,
): Promise<void> {
  const channel = getSessionQAChannel(sessionId);
  const payload = JSON.stringify({
    ...event,
    // Serialize dates
    ...(event.type.startsWith("question_") && "question" in event
      ? {
          question: {
            ...event.question,
            createdAt: event.question.createdAt.toISOString(),
          },
        }
      : {}),
    ...(event.type.startsWith("answer_") && "answer" in event
      ? {
          answer: {
            ...event.answer,
            createdAt: event.answer.createdAt.toISOString(),
          },
        }
      : {}),
  });

  await publisher.publish(channel, payload);
}

// Subscribe to Q&A events for a specific session
export async function* subscribeToSessionQA(
  sessionId: string,
  signal?: AbortSignal,
): AsyncGenerator<SessionQAEvent> {
  const subscriber = createSubscriber();
  const channel = getSessionQAChannel(sessionId);

  const eventQueue: SessionQAEvent[] = [];
  let resolveWaiting: ((value: void) => void) | null = null;
  let isSubscribed = true;

  subscriber.subscribe(channel);

  subscriber.on("message", (_channel, message) => {
    const parsed = JSON.parse(message);

    // Deserialize dates
    if (parsed.question?.createdAt) {
      parsed.question.createdAt = new Date(parsed.question.createdAt);
    }
    if (parsed.answer?.createdAt) {
      parsed.answer.createdAt = new Date(parsed.answer.createdAt);
    }

    eventQueue.push(parsed as SessionQAEvent);

    if (resolveWaiting) {
      resolveWaiting();
      resolveWaiting = null;
    }
  });

  const cleanup = () => {
    isSubscribed = false;
    subscriber.unsubscribe(channel);
    subscriber.quit();
  };

  signal?.addEventListener("abort", cleanup);

  try {
    while (isSubscribed) {
      if (eventQueue.length > 0) {
        yield eventQueue.shift()!;
      } else {
        await new Promise<void>((resolve) => {
          resolveWaiting = resolve;
        });
      }
    }
  } finally {
    signal?.removeEventListener("abort", cleanup);
    cleanup();
  }
}
