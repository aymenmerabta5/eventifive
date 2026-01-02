import { proposeWorkshopRouter } from "./proposeWorkshop";
import { listProposalsRouter } from "./listProposals";
import { getProposalRouter } from "./getProposal";
import { acceptProposalRouter } from "./acceptProposal";
import { rejectProposalRouter } from "./rejectProposal";
import { listMyProposalsRouter } from "./listMyProposals";
import { getMyWorkshopForEventRouter } from "./getMyWorkshopForEvent";
import { getWorkshopDetailsRouter } from "./getWorkshopDetails";
import { listByEventRouter } from "./listByEvent";
import { registerForWorkshopRouter } from "./registerForWorkshop";
import { unregisterFromWorkshopRouter } from "./unregisterFromWorkshop";
import { myWorkshopRegistrationsRouter } from "./myWorkshopRegistrations";
import { getWorkshopRegistrationStatusRouter } from "./getWorkshopRegistrationStatus";
import { listMaterialsRouter } from "./listMaterials";
import { getMaterialDownloadRouter } from "./getMaterialDownload";
import { deleteMaterialRouter } from "./deleteMaterial";

export const workshopsRouter = {
  // Existing proposal endpoints
  propose: proposeWorkshopRouter,
  listProposals: listProposalsRouter,
  get: getProposalRouter,
  accept: acceptProposalRouter,
  reject: rejectProposalRouter,
  listMine: listMyProposalsRouter,
  getMyWorkshopForEvent: getMyWorkshopForEventRouter,
  getDetails: getWorkshopDetailsRouter,
  // Registration endpoints
  listByEvent: listByEventRouter,
  register: registerForWorkshopRouter,
  unregister: unregisterFromWorkshopRouter,
  myRegistrations: myWorkshopRegistrationsRouter,
  getRegistrationStatus: getWorkshopRegistrationStatusRouter,
  // Materials endpoints
  listMaterials: listMaterialsRouter,
  getMaterialDownload: getMaterialDownloadRouter,
  deleteMaterial: deleteMaterialRouter,
};

// Re-export individual routers
export { proposeWorkshopRouter };
export { listProposalsRouter };
export { getProposalRouter };
export { acceptProposalRouter };
export { rejectProposalRouter };
export { listMyProposalsRouter };
export { getMyWorkshopForEventRouter };
export { getWorkshopDetailsRouter };
export { listByEventRouter };
export { registerForWorkshopRouter };
export { unregisterFromWorkshopRouter };
export { myWorkshopRegistrationsRouter };
export { getWorkshopRegistrationStatusRouter };
export { listMaterialsRouter };
export { getMaterialDownloadRouter };
export { deleteMaterialRouter };
