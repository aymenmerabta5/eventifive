import { messagingSystem } from "./messaging";
import { questionAnswerSystem } from "./question-answer";

// Export both systems
export const websocketsRouter = {
  messages: messagingSystem,
  qa: questionAnswerSystem,
};

// Re-export systems for direct access
export { messagingSystem, questionAnswerSystem };

// Backwards compatibility - export messagesRouter pointing to messaging system
export const messagesRouter = messagingSystem;
