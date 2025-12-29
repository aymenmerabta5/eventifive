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
        // Email-safe hex colors (converted from oklch for email client compatibility)
        background: "#f4f2f7",
        foreground: "#3d3654",
        card: "#f9f8fb",
        cardForeground: "#3d3654",
        primary: "#6d4aad",
        primaryForeground: "#ffffff",
        secondary: "#e4ddef",
        secondaryForeground: "#5a4982",
        muted: "#eceaf1",
        mutedForeground: "#7a7189",
        accent: "#e2e0ef",
        accentForeground: "#3d3654",
        destructive: "#e54d4d",
        border: "#e0dde8",
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
        <Body className="bg-background text-foreground">
          <Container className="mx-auto max-w-2xl px-6 py-10">
            {children}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export { tailwindConfig };
