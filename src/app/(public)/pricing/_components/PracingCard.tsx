"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";

interface Feature {
  text: string;
  included?: boolean;
}

interface PricingTier {
  name: string;
  description: string;
  monthlyPrice: string;
  yearlyPrice: string;
  buttonText: string;
  buttonVariant: "default" | "secondary" | "outline";
  features: Feature[];
  popular?: boolean;
}

const pricingTiers: PricingTier[] = [
  {
    name: "Basic",
    description: "Perfect for trying out our event generator.",
    monthlyPrice: "1000",
    yearlyPrice: "9000",
    buttonText: "Get started",
    buttonVariant: "outline",
    features: [
      { text: "Up to 10 events per month", included: true },
      { text: "Basic event templates", included: true },
      { text: "Email support", included: true },
      { text: "Event analytics", included: false },
      { text: "Custom branding", included: false },
      { text: "API access", included: false },
      { text: "Priority support", included: false },
    ],
  },
  {
    name: "Standard",
    description: "Perfect for small businesses and organizations that require a more comprehensive event management solution.",
    monthlyPrice: "9.99",
    yearlyPrice: "8.49",
    buttonText: "Get started",
    buttonVariant: "default",
    features: [
      { text: "Up to 100 events per month", included: true },
      { text: "Premium event templates", included: true },
      { text: "Priority email support", included: true },
      { text: "Advanced event analytics", included: true },
      { text: "Custom branding", included: true },
      { text: "API access", included: false },
      { text: "Dedicated account manager", included: false },
    ],
    popular: true,
  },
  {
    name: "Premium",
    description: "Perfect for large businesses and organizations that require a fully customizable event management solution.",
    monthlyPrice: "2000",
    yearlyPrice: "18000",
    buttonText: "Contact sale",
    buttonVariant: "outline",
    features: [
      { text: "Unlimited events", included: true },
      { text: "All premium templates", included: true },
      { text: "24/7 phone & email support", included: true },
      { text: "Real-time analytics & reporting", included: true },
      { text: "Full custom branding", included: true },
      { text: "Full API access", included: true },
      { text: "Dedicated account manager", included: true },
    ],
  },
];

export default function PracingCard() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-7">
      <div className="flex items-center justify-center gap-4">
        <div className="relative inline-flex items-center bg-card border border-border rounded-full p-1 shadow-sm">
          <motion.div
            className="absolute bg-primary rounded-full h-[calc(100%-8px)] shadow-sm"
            initial={false}
            animate={{
              x: isYearly ? "calc(100% + 8px)" : "4px",
              width: isYearly ? "88px" : "88px"
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
          <button
            onClick={() => setIsYearly(false)}
            className={`relative z-10 px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              !isYearly
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={`relative z-10 px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              isYearly
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Yearly
          </button>
        </div>
      </div>
      <div className="text-center">
        <span className="text-sm text-muted-foreground">
          Save up to 15% by paying yearly
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {pricingTiers.map((tier, index) => (
        <Card
          key={index}
          className={`relative flex flex-col ${
            tier.popular
              ? "border-primary shadow-lg scale-105 bg-background/70 backdrop-blur-sm"
              : "border-border "
          }`}
        >
          {tier.popular && (
            <div className="absolute -top-3 right-6">
              <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                Popular
              </span>
            </div>
          )}
          
          <CardHeader className="space-y-4">
            <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
            <p className="text-sm text-muted-foreground min-h-[60px]">
              {tier.description}
            </p>
            
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold">
                {isYearly ? tier.yearlyPrice : tier.monthlyPrice}
              </span>
              <span className="text-2xl font-medium text-muted-foreground">DA</span>
                  {isYearly ? <span className="text-muted-foreground">/year</span> 
                    : <span className="text-muted-foreground">/month</span>}
            </div>
          </CardHeader>

          <CardContent className="flex-1 space-y-6">
            <Button
              variant={tier.buttonVariant}
              className={`w-full ${
                tier.popular ? "bg-primary hover:bg-primary/90" : ""
              }`}
            >
              {tier.buttonText}
            </Button>

            <div className="space-y-3">
              {tier.features.map((feature, featureIndex) => (
                <div key={featureIndex} className="flex items-start gap-3">
                  <div className={`rounded-full p-1 mt-0.5 ${
                    feature.included !== false
                      ? "bg-primary/10"
                      : "bg-muted"
                  }`}>
                    {feature.included !== false ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <span className={`text-sm flex-1 ${
                    feature.included !== false
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}>
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
      </div>
    </div>
  );
}