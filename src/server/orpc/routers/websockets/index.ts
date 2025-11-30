import { sendMessageRouter } from "./sendMessage";
import { getConversationsRouter } from "./getConversations";
import { getMessagesRouter } from "./getMessages";
import { createConversationRouter } from "./createConversation";
import { subscribeMessagesRouter } from "./subscribeMessages";

export const websocketsRouter = {
	sendMessage: sendMessageRouter,
	getConversations: getConversationsRouter,
	getMessages: getMessagesRouter,
	createConversation: createConversationRouter,
	subscribeMessages: subscribeMessagesRouter,
};
