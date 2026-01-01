import { addCommunicatorRouter } from "./addCommunicator";
import { removeCommunicatorRouter } from "./removeCommunicator";
import { listCommunicatorsRouter } from "./listCommunicators";

export const communicatorsRouter = {
  add: addCommunicatorRouter,
  remove: removeCommunicatorRouter,
  list: listCommunicatorsRouter,
};

// Re-export individual routers
export { addCommunicatorRouter };
export { removeCommunicatorRouter };
export { listCommunicatorsRouter };
