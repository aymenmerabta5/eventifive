/*
 *   Copyright (c) 2025 Aimen Merabta
 *   All rights reserved.
 *   Strict Notice: Unauthorized copying, use, or distribution of this code is strictly prohibited. Violators may be prosecuted and reported to law enforcement.
 */
import { Html, Head, Body, Container } from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";
import type { ReactNode } from "react";

interface EmailLayoutProps {
  children: ReactNode;
  title?: string;
}

const tailwindConfig = {
  theme: {
    extend: {
      colors: {
        background: "oklch(0.9730 0.0133 286.1503)",
        foreground: "oklch(0.3015 0.0572 282.4176)",
        card: "oklch(0.9850 0.0080 286.1503)",
        cardForeground: "oklch(0.3015 0.0572 282.4176)",
        popover: "oklch(0.9850 0.0080 286.1503)",
        popoverForeground: "oklch(0.3015 0.0572 282.4176)",
        primary: "oklch(0.5417 0.1790 288.0332)",
        primaryForeground: "oklch(1.0000 0 0)",
        secondary: "oklch(0.9174 0.0435 292.6901)",
        secondaryForeground: "oklch(0.4143 0.1039 288.1742)",
        muted: "oklch(0.9580 0.0133 286.1454)",
        mutedForeground: "oklch(0.5426 0.0465 284.7435)",
        accent: "oklch(0.9221 0.0373 262.1410)",
        accentForeground: "oklch(0.3015 0.0572 282.4176)",
        destructive: "oklch(0.6861 0.2061 14.9941)",
        destructiveForeground: "oklch(1.0000 0 0)",
        border: "oklch(0.9115 0.0216 285.9625)",
        input: "oklch(0.9115 0.0216 285.9625)",
        ring: "oklch(0.5417 0.1790 288.0332)",
        chart1: "oklch(0.5417 0.1790 288.0332)",
        chart2: "oklch(0.7042 0.1602 288.9880)",
        chart3: "oklch(0.5679 0.2113 276.7065)",
        chart4: "oklch(0.6356 0.1922 281.8054)",
        chart5: "oklch(0.4509 0.1758 279.3838)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: [
          "Plus Jakarta Sans",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        sm: "calc(0.5rem - 4px)",
        md: "calc(0.5rem - 2px)",
        lg: "0.5rem",
        xl: "calc(0.5rem + 4px)",
      },
      boxShadow: {
        "2xs": "0px 4px 10px 0px hsl(240 30% 25% / 0.06)",
        xs: "0px 4px 10px 0px hsl(240 30% 25% / 0.06)",
        sm: "0px 4px 10px 0px hsl(240 30% 25% / 0.12), 0px 1px 2px -1px hsl(240 30% 25% / 0.12)",
        DEFAULT:
          "0px 4px 10px 0px hsl(240 30% 25% / 0.12), 0px 1px 2px -1px hsl(240 30% 25% / 0.12)",
        md: "0px 4px 10px 0px hsl(240 30% 25% / 0.12), 0px 2px 4px -1px hsl(240 30% 25% / 0.12)",
        lg: "0px 4px 10px 0px hsl(240 30% 25% / 0.12), 0px 4px 6px -1px hsl(240 30% 25% / 0.12)",
        xl: "0px 4px 10px 0px hsl(240 30% 25% / 0.12), 0px 8px 10px -1px hsl(240 30% 25% / 0.12)",
        "2xl": "0px 4px 10px 0px hsl(240 30% 25% / 0.30)",
      },
    },
  },
};

export default function EmailLayout({
  children,
  title = "eventifive",
}: EmailLayoutProps) {
  return (
    <Html>
      <Head>
        <title>{title}</title>
      </Head>
      <Tailwind config={tailwindConfig}>
        <Body className="bg-background text-foreground min-h-screen font-sans">
          <Container className="mx-auto min-h-screen max-w-2xl px-6 py-10">
            {children}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export { tailwindConfig };
