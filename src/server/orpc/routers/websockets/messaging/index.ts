import { sendMessageRouter } from "./sendMessage";
import { getConversationsRouter } from "./getConversations";
import { getMessagesRouter } from "./getMessages";
import { createConversationRouter } from "./createConversation";
import { subscribeMessagesRouter } from "./subscribeMessages";
import { subscribePresenceRouter } from "./subscribePresence";
import { getPresenceRouter } from "./getPresence";
import {
  setTypingRouter,
  clearTypingRouter,
  subscribeTypingRouter,
} from "./typing";
import {
  markAsReadRouter,
  getReadReceiptsRouter,
  subscribeReadReceiptsRouter,
} from "./readReceipts";

export const messagingSystem = {
  send: sendMessageRouter,
  listConversations: getConversationsRouter,
  listMessages: getMessagesRouter,
  createConversation: createConversationRouter,
  subscribe: subscribeMessagesRouter,
  subscribePresence: subscribePresenceRouter,
  getPresence: getPresenceRouter,
  // Typing indicators
  setTyping: setTypingRouter,
  clearTyping: clearTypingRouter,
  subscribeTyping: subscribeTypingRouter,
  // Read receipts
  markAsRead: markAsReadRouter,
  getReadReceipts: getReadReceiptsRouter,
  subscribeReadReceipts: subscribeReadReceiptsRouter,
};

// Re-export individual routers
export {
  sendMessageRouter,
  getConversationsRouter,
  getMessagesRouter,
  createConversationRouter,
  subscribeMessagesRouter,
  subscribePresenceRouter,
  getPresenceRouter,
  // Typing
  setTypingRouter,
  clearTypingRouter,
  subscribeTypingRouter,
  // Read receipts
  markAsReadRouter,
  getReadReceiptsRouter,
  subscribeReadReceiptsRouter,
};
