---
name: payment-integration
description: Integrate Chargily payments for subscriptions and event registrations - checkout flows, webhooks, payment status. Use when working with payment features, subscription management, or billing.
---

# Payment Integration (Chargily)

## Methodology - ALWAYS FOLLOW

Before implementing any payment changes:

### Step 1: Ask Clarifying Questions
- Is this for subscriptions or event registration?
- What payment amounts/currencies are involved?
- How should payment success/failure be handled?
- Are there webhook requirements?
- What about refund scenarios?

### Step 2: Enter Plan Mode
Use `EnterPlanMode` to create a detailed implementation plan:
- Review existing payment flows
- Check Chargily integration patterns
- Plan webhook handling
- Consider idempotency
- Document error scenarios

### Step 3: Deep Analysis (Extended Thinking)
Think deeply about:
- Payment security (never log sensitive data)
- Webhook signature verification
- Idempotency for duplicate webhooks
- Transaction rollback on failures
- Currency handling (DZD, whole units)

### Step 4: Get User Approval
Present the plan and wait for explicit approval before any implementation.

---

## Key Files

| Component | Location |
|-----------|----------|
| Payment Router | `src/server/orpc/routers/payment/` |
| Subscription Router | `src/server/orpc/routers/subscription/` |
| Chargily Client | `src/server/gateway/chargily.ts` |
| Event Sync | `src/server/gateway/chargilySyncEvent.ts` |
| Subscription Sync | `src/server/gateway/chargilySync.ts` |
| Payment Schemas | `src/lib/schemas/payment.ts` |

---

## Currency Handling

- **Default Currency**: DZD (Algerian Dinar)
- **Storage**: Whole units (5000 DZD, NOT cents)
- **Chargily**: Also uses whole units

---

## Payment Status Flow

```
unpaid → pending → paid → refunded
```

### Enums
```typescript
paymentStatusEnum: unpaid, pending, paid, refunded
billingPeriodEnum: monthly, yearly
subscriptionStatusEnum: pending, active, cancelled, expired
```

---

## Checkout Flows

### Event Registration Checkout
```typescript
const checkout = await client.payment.createEventCheckout({
  eventId: "event-id",
  successUrl: "/payment/success",
  failureUrl: "/payment/failure",
});

// Redirect to Chargily
window.location.href = checkout.checkoutUrl;
```

### Subscription Checkout
```typescript
const checkout = await client.payment.createCheckout({
  planId: "plan-id",
  billingPeriod: "monthly", // or "yearly"
  successUrl: "/subscription/success",
  failureUrl: "/subscription/failure",
});

window.location.href = checkout.checkoutUrl;
```

### Check Payment Status
```typescript
const status = await client.payment.getStatus({
  checkoutId: checkout.checkoutId
});
// Returns: { status: "paid" | "pending" | ... }
```

---

## Subscription Management

### List Plans
```typescript
const plans = await client.subscription.listPlans();
```

### Get Current Subscription
```typescript
const subscription = await client.subscription.getCurrent();
```

### Create Plan (Admin)
```typescript
await client.subscription.createPlan({
  name: "Pro Plan",
  description: "Full features",
  monthlyPrice: 5000,
  yearlyPrice: 50000,
});
```

### Sync with Chargily
```typescript
await client.subscription.syncPlans();
```

---

## Webhook Handling

### Security Requirements
1. **Signature Verification**: Always verify Chargily webhook signatures
2. **Idempotency**: Check if payment already processed
3. **Transaction Safety**: Use database transactions

### Pattern
```typescript
// Verify signature first
const isValid = verifyChargilySignature(payload, signature);
if (!isValid) {
  throw new ORPCError("UNAUTHORIZED", "Invalid signature");
}

// Check idempotency
const existing = await db.query.payment.findFirst({
  where: eq(payment.checkoutId, payload.checkoutId),
});
if (existing?.status === "paid") {
  return { success: true }; // Already processed
}

// Process payment in transaction
await db.transaction(async (tx) => {
  await tx.update(payment).set({ status: "paid" });
  // Update related records...
});
```

---

## Database Tables

| Table | Purpose |
|-------|---------|
| payment | Payment records |
| subscriptionPlan | Plan definitions |
| subscriptionPrice | Price tiers (monthly/yearly) |
| userSubscription | User's active subscription |
| eventRegistration | Event payment/registration |

---

## Key Endpoints

### Payment Router
- `payment.createCheckout` - Subscription checkout
- `payment.createEventCheckout` - Event registration checkout
- `payment.getStatus` - Check payment status
- `payment.list` - User's payment history

### Subscription Router
- `subscription.listPlans` - All available plans
- `subscription.createPlan` - Create new plan
- `subscription.syncPlans` - Sync with Chargily
- `subscription.getCurrent` - User's current subscription

---

## Environment Variables

```bash
CHARGILY_SK=your_secret_key
NEXT_PUBLIC_CHARGILY_PK=your_public_key
```

---

## Security Checklist

- [ ] Never log payment secrets
- [ ] Always verify webhook signatures
- [ ] Use HTTPS for all payment endpoints
- [ ] Implement idempotency checks
- [ ] Use transactions for payment state changes
- [ ] Validate amounts server-side
