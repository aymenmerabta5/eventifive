import { listMyBadgesRouter } from "./listMyBadges";
import { downloadBadgeRouter } from "./download";
import { verifyBadgeRouter } from "./verify";
import { listBadgesByEventRouter } from "./listByEvent";
import { revokeBadgeRouter } from "./revoke";

export const badgesRouter = {
  listMyBadges: listMyBadgesRouter,
  download: downloadBadgeRouter,
  verify: verifyBadgeRouter,
  listByEvent: listBadgesByEventRouter,
  revoke: revokeBadgeRouter,
};

export {
  listMyBadgesRouter,
  downloadBadgeRouter,
  verifyBadgeRouter,
  listBadgesByEventRouter,
  revokeBadgeRouter,
};
