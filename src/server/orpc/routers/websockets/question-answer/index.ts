import { askQuestionRouter } from "./askQuestion";
import { getQuestionsRouter } from "./getQuestions";
import { likeQuestionRouter } from "./likeQuestion";
import { answerQuestionRouter } from "./answerQuestion";
import { deleteQuestionRouter } from "./deleteQuestion";
import { approveQuestionRouter } from "./approveQuestion";
import { subscribeQuestionsRouter } from "./subscribeQuestions";

export const questionAnswerSystem = {
  ask: askQuestionRouter,
  list: getQuestionsRouter,
  like: likeQuestionRouter,
  answer: answerQuestionRouter,
  delete: deleteQuestionRouter,
  approve: approveQuestionRouter,
  subscribe: subscribeQuestionsRouter,
};

// Re-export individual routers
export {
  askQuestionRouter,
  getQuestionsRouter,
  likeQuestionRouter,
  answerQuestionRouter,
  deleteQuestionRouter,
  approveQuestionRouter,
  subscribeQuestionsRouter,
};
