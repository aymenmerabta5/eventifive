import { getEligibleRecipientsRouter } from "./getEligibleRecipients";
import { generateCertificatesRouter } from "./generate";
import { listCertificatesByEventRouter } from "./listByEvent";
import { listMyCertificatesRouter } from "./listMyCertificates";
import { downloadCertificateRouter } from "./download";
import { verifyCertificateRouter } from "./verify";
import { revokeCertificateRouter } from "./revoke";

export const certificatesRouter = {
  getEligibleRecipients: getEligibleRecipientsRouter,
  generate: generateCertificatesRouter,
  listByEvent: listCertificatesByEventRouter,
  listMyCertificates: listMyCertificatesRouter,
  download: downloadCertificateRouter,
  verify: verifyCertificateRouter,
  revoke: revokeCertificateRouter,
};

export {
  getEligibleRecipientsRouter,
  generateCertificatesRouter,
  listCertificatesByEventRouter,
  listMyCertificatesRouter,
  downloadCertificateRouter,
  verifyCertificateRouter,
  revokeCertificateRouter,
};
