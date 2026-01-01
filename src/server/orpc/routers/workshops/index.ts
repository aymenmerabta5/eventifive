import { proposeWorkshopRouter } from "./proposeWorkshop";
import { listProposalsRouter } from "./listProposals";
import { getProposalRouter } from "./getProposal";
import { acceptProposalRouter } from "./acceptProposal";
import { rejectProposalRouter } from "./rejectProposal";
import { listMyProposalsRouter } from "./listMyProposals";

export const workshopsRouter = {
  propose: proposeWorkshopRouter,
  listProposals: listProposalsRouter,
  get: getProposalRouter,
  accept: acceptProposalRouter,
  reject: rejectProposalRouter,
  listMine: listMyProposalsRouter,
};

// Re-export individual routers
export { proposeWorkshopRouter };
export { listProposalsRouter };
export { getProposalRouter };
export { acceptProposalRouter };
export { rejectProposalRouter };
export { listMyProposalsRouter };
