import { messagingSystem } from "./messaging";
import { questionAnswerSystem } from "./question-answer";
import { pollsSystem } from "./polls";

// Export all systems
export const websocketsRouter = {
  messages: messagingSystem,
  qa: questionAnswerSystem,
  polls: pollsSystem,
};

// Re-export systems for direct access
export { messagingSystem, questionAnswerSystem, pollsSystem };

// Backwards compatibility - export messagesRouter pointing to messaging system
export const messagesRouter = messagingSystem;
