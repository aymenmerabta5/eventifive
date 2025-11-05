/*
 *   Copyright (c) 2025 Aimen Merabta
 *   All rights reserved.
 *   Strict Notice: Unauthorized copying, use, or distribution of this code is strictly prohibited. Violators may be prosecuted and reported to law enforcement.
 */
"use server";
import "server-only";
import { env } from "@/env";
import { Resend } from "resend";
import { render } from "@react-email/render";
import React from "react";

const resend = new Resend(env.RESEND_API_KEY);

export const sendEmail = async <T>(
  to: string | string[],
  subject: string,
  EmailComponent: React.ComponentType<T>,
  componentProps: T,
  options?: {
    from?: string;
    replyTo?: string;
    cc?: string | string[];
    bcc?: string | string[];
  },
) => {
  try {
    const emailJSX = React.createElement(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      EmailComponent as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      componentProps as any,
    );

    const html = await render(emailJSX);

    const { data, error } = await resend.emails.send({
      from: options?.from ?? env.RESEND_SENDER_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      replyTo: options?.replyTo,
      cc: options?.cc,
      bcc: options?.bcc,
    });

    if (error) {
      console.error("Resend API error:", error);
      throw new Error(`Email sending failed: ${error.message}`);
    }

    if (!data) {
      throw new Error("Email sending failed: No response data");
    }

    console.log("Email sent successfully:", data.id);
    return {
      success: true,
      code: "SUCCESS_EMAIL_RESET",
      message:
        "If there is an email in our platform, you will receive a password reset link shortly.",
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};
