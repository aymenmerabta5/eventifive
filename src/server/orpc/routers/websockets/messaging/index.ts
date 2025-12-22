import { sendMessageRouter } from "./sendMessage";
import { getConversationsRouter } from "./getConversations";
import { getMessagesRouter } from "./getMessages";
import { createConversationRouter } from "./createConversation";
import { subscribeMessagesRouter } from "./subscribeMessages";
import { subscribePresenceRouter } from "./subscribePresence";
import { getPresenceRouter } from "./getPresence";

export const messagingSystem = {
  send: sendMessageRouter,
  listConversations: getConversationsRouter,
  listMessages: getMessagesRouter,
  createConversation: createConversationRouter,
  subscribe: subscribeMessagesRouter,
  subscribePresence: subscribePresenceRouter,
  getPresence: getPresenceRouter,
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
};
