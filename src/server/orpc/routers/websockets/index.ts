import { sendMessageRouter } from "./sendMessage";
import { getConversationsRouter } from "./getConversations";
import { getMessagesRouter } from "./getMessages";
import { createConversationRouter } from "./createConversation";
import { subscribeMessagesRouter } from "./subscribeMessages";

export const messagesRouter = {
  send: sendMessageRouter,
  listConversations: getConversationsRouter,
  listMessages: getMessagesRouter,
  createConversation: createConversationRouter,
  subscribe: subscribeMessagesRouter,
};

// Export with the old name for backwards compatibility
export const websocketsRouter = messagesRouter;

// Re-export individual routers for backwards compatibility
export {
  sendMessageRouter,
  getConversationsRouter,
  getMessagesRouter,
  createConversationRouter,
  subscribeMessagesRouter,
};
