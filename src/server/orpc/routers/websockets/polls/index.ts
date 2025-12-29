import { createPollRouter } from "./createPoll";
import { closePollRouter } from "./closePoll";
import { voteRouter } from "./vote";
import { getResultsRouter } from "./getResults";
import { listPollsRouter } from "./listPolls";
import { subscribePollsRouter } from "./subscribePoll";

export const pollsSystem = {
  create: createPollRouter,
  close: closePollRouter,
  vote: voteRouter,
  results: getResultsRouter,
  list: listPollsRouter,
  subscribe: subscribePollsRouter,
};

export {
  createPollRouter,
  closePollRouter,
  voteRouter,
  getResultsRouter,
  listPollsRouter,
  subscribePollsRouter,
};
