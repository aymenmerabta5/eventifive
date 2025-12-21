// Messaging domain types - aligned with backend schema

export interface User {
  id: string;
  name: string;
  image: string | null;
}

export interface Conversation {
  id: string;
  otherUser: User;
  lastMessage: {
    id: string;
    content: string;
    senderId: string;
    createdAt: Date;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderImage: string | null;
  content: string;
  createdAt: Date;
}

// Simplified message for real-time events (from Redis pub/sub)
export interface RealtimeMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: Date;
}

// UI-specific conversation type with computed properties
export interface ConversationWithStatus extends Conversation {
  unreadCount: number;
  isOnline: boolean;
}
