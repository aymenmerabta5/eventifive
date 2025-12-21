// Subscription status
export type SubscriptionStatusType =
  | "active"
  | "pending"
  | "cancelled"
  | "expired";

// Plan features
export interface PlanInfo {
  displayName: string;
  features: string[];
}

// Price info
export interface PriceInfo {
  amount: number;
  currency: string;
  billingPeriod: string;
}

// Subscription data from API
export interface SubscriptionData {
  status: SubscriptionStatusType;
  plan: PlanInfo;
  price: PriceInfo;
  currentPeriodEnd: Date;
}
