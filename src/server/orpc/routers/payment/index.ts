import { createCheckoutRouter } from "./createCheckout";
import { getPaymentStatusRouter } from "./getPaymentStatus";
import { listUserPaymentsRouter } from "./listUserPayments";

export const paymentRouter = {
  createCheckout: createCheckoutRouter,
  getStatus: getPaymentStatusRouter,
  listPayments: listUserPaymentsRouter,
};
