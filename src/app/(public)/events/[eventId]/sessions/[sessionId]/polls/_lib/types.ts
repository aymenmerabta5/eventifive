// Poll types for frontend use

export type PollType = "single" | "multiple";

export interface PollOption {
  id: number;
  text: string;
  displayOrder: number;
  voteCount?: number;
  percentage?: number;
}

export interface Poll {
  id: string;
  question: string;
  pollType: PollType;
  isActive: boolean;
  createdBy: string;
  createdByName: string;
  createdAt: Date;
  closedAt: Date | null;
  options: PollOption[];
  totalVotes?: number;
  userVotedOptionIds: number[];
}

export interface PollResults {
  pollId: string;
  totalVotes: number;
  options: Array<{
    optionId: number;
    text: string;
    voteCount: number;
    percentage: number;
  }>;
}

// Event types from WebSocket
export interface PollCreatedEvent {
  type: "poll_created";
  poll: {
    id: string;
    sessionId: string;
    question: string;
    pollType: PollType;
    isActive: boolean;
    createdBy: string;
    createdByName: string;
    createdAt: Date;
    options: Array<{
      id: number;
      text: string;
      displayOrder: number;
    }>;
  };
}

export interface PollClosedEvent {
  type: "poll_closed";
  pollId: string;
  closedAt: Date;
  results: PollResults;
}

export interface VoteCastEvent {
  type: "vote_cast";
  pollId: string;
  results: PollResults;
}

export interface VoteChangedEvent {
  type: "vote_changed";
  pollId: string;
  results: PollResults;
}

export type SessionPollEvent =
  | PollCreatedEvent
  | PollClosedEvent
  | VoteCastEvent
  | VoteChangedEvent;

// Query data type
export interface PollsData {
  polls: Poll[];
  isSessionManager: boolean;
}
