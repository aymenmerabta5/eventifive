import { createCheckoutRouter } from "./createCheckout";
import { getPaymentStatusRouter } from "./getPaymentStatus";
import { listUserPaymentsRouter } from "./listUserPayments";

export const paymentRouter = {
	createCheckout: createCheckoutRouter,
	getStatus: getPaymentStatusRouter,
	list: listUserPaymentsRouter,
};

// Re-export individual routers for backwards compatibility
export { createCheckoutRouter, getPaymentStatusRouter, listUserPaymentsRouter };
