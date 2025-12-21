import { createCheckoutRouter } from "./createCheckout";
import { createEventCheckoutRouter } from "./createEventCheckout";
import { getPaymentStatusRouter } from "./getPaymentStatus";
import { listUserPaymentsRouter } from "./listUserPayments";

export const paymentRouter = {
  createCheckout: createCheckoutRouter,
  createEventCheckout: createEventCheckoutRouter,
  getStatus: getPaymentStatusRouter,
  list: listUserPaymentsRouter,
};

// Re-export individual routers for backwards compatibility
export {
  createCheckoutRouter,
  createEventCheckoutRouter,
  getPaymentStatusRouter,
  listUserPaymentsRouter,
};
