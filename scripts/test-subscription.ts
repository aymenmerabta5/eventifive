#!/usr/bin/env bun
/**
 * CLI script for testing subscription webhook flows
 *
 * Usage:
 *   bun run test:subscription                              # List plans and pending subscription payments
 *   bun run test:subscription -- --user-id <id> --price-id <id>  # Create + simulate subscription
 *   bun run test:subscription -- --payment-id <id>         # Simulate for specific payment
 *   bun run test:subscription -- --all                     # Process all pending subscription payments
 *   bun run test:subscription -- --list-plans              # List available subscription plans
 *   bun run test:subscription -- --list-users              # List users
 */

import {
  colors,
  type WebhookEventType,
  getPendingSubscriptionPayments,
  getPaymentById,
  printPendingPayments,
  getPendingPaymentsWithDetails,
  simulateWebhook,
  createTestSubscriptionPayment,
  listSubscriptionPlans,
  listUsers,
  type PaymentRecord,
} from "@/server/tests";

interface CliArgs {
  paymentId?: string;
  userId?: string;
  priceId?: string;
  type: WebhookEventType;
  baseUrl?: string;
  all: boolean;
  listPlans: boolean;
  listUsersFlag: boolean;
  create: boolean;
  help: boolean;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  const result: CliArgs = {
    type: "checkout.paid",
    all: false,
    listPlans: false,
    listUsersFlag: false,
    create: false,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--payment-id":
        result.paymentId = args[++i];
        break;
      case "--user-id":
        result.userId = args[++i];
        break;
      case "--price-id":
        result.priceId = args[++i];
        break;
      case "--type":
        const t = args[++i];
        if (t === "paid") result.type = "checkout.paid";
        else if (t === "failed") result.type = "checkout.failed";
        else if (t === "expired") result.type = "checkout.expired";
        else {
          console.error(`Invalid type: ${t}. Use: paid, failed, expired`);
          process.exit(1);
        }
        break;
      case "--all":
        result.all = true;
        break;
      case "--url":
        result.baseUrl = args[++i];
        break;
      case "--list-plans":
        result.listPlans = true;
        break;
      case "--list-users":
        result.listUsersFlag = true;
        break;
      case "--create":
        result.create = true;
        break;
      case "--help":
      case "-h":
        result.help = true;
        break;
    }
  }

  return result;
}

function printHelp() {
  console.log(`
${colors.cyan}Subscription Webhook Test Script${colors.reset}

Simulates Chargily webhook calls for testing subscription payment flows.
Useful because Chargily doesn't invoke webhooks in test mode.

${colors.yellow}Usage:${colors.reset}
  bun run test:subscription [options]

${colors.yellow}Options:${colors.reset}
  --user-id <id>       User ID to subscribe
  --price-id <id>      Subscription price ID (get from --list-plans)
  --payment-id <id>    Simulate webhook for a specific payment ID
  --type <type>        Webhook event type: paid (default), failed, expired
  --url <url>          Base URL for webhook (default: BETTER_AUTH_URL or localhost:3000)
  --all                Process ALL pending subscription payments
  --list-plans         List available subscription plans and prices
  --list-users         List available users
  --create             Create test payment only (don't simulate webhook)
  --help, -h           Show this help message

${colors.yellow}Examples:${colors.reset}
  ${colors.dim}# List subscription plans to get price IDs${colors.reset}
  bun run test:subscription -- --list-plans

  ${colors.dim}# List users to get user IDs${colors.reset}
  bun run test:subscription -- --list-users

  ${colors.dim}# Create subscription + simulate paid webhook${colors.reset}
  bun run test:subscription -- --user-id abc123 --price-id price_456

  ${colors.dim}# Create subscription payment only (no webhook)${colors.reset}
  bun run test:subscription -- --user-id abc123 --price-id price_456 --create

  ${colors.dim}# Simulate for a specific existing payment${colors.reset}
  bun run test:subscription -- --payment-id pay_789

  ${colors.dim}# Process all pending subscription payments${colors.reset}
  bun run test:subscription -- --all
`);
}

async function main() {
  const args = parseArgs();

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  console.log(
    `\n${colors.cyan}═══════════════════════════════════════════${colors.reset}`,
  );
  console.log(
    `${colors.cyan}  Subscription Webhook Test Script${colors.reset}`,
  );
  console.log(
    `${colors.cyan}═══════════════════════════════════════════${colors.reset}`,
  );

  // Handle list commands
  if (args.listPlans) {
    await listSubscriptionPlans();
    process.exit(0);
  }

  if (args.listUsersFlag) {
    await listUsers();
    process.exit(0);
  }

  // Handle create + simulate for user + price
  if (args.userId && args.priceId) {
    console.log(
      `\n${colors.blue}Creating test subscription payment...${colors.reset}\n`,
    );

    const createResult = await createTestSubscriptionPayment(
      args.userId,
      args.priceId,
    );

    if (!createResult.success) {
      console.error(`${colors.red}✗${colors.reset} ${createResult.message}\n`);
      process.exit(1);
    }

    if (args.create) {
      console.log(
        `\n${colors.green}Done!${colors.reset} Use --payment-id ${createResult.paymentId} to simulate webhook.\n`,
      );
      process.exit(0);
    }

    // Simulate webhook
    console.log(`\n${colors.blue}Simulating webhook...${colors.reset}\n`);
    const payment = await getPaymentById(createResult.paymentId!);
    if (!payment) {
      console.error(
        `${colors.red}✗${colors.reset} Payment not found after creation\n`,
      );
      process.exit(1);
    }

    const result = await simulateWebhook(payment, args.type, args.baseUrl);
    if (result.success) {
      console.log(
        `${colors.green}✓${colors.reset} HTTP ${result.httpStatus} - ${result.message}`,
      );
      console.log(`\n${colors.green}Subscription activated!${colors.reset}\n`);
    } else {
      console.error(
        `${colors.red}✗${colors.reset} HTTP ${result.httpStatus} - ${result.message}\n`,
      );
      process.exit(1);
    }
    process.exit(0);
  }

  // Handle specific payment ID
  if (args.paymentId) {
    const payment = await getPaymentById(args.paymentId);
    if (!payment) {
      console.error(
        `\n${colors.red}✗${colors.reset} Payment not found: ${args.paymentId}\n`,
      );
      process.exit(1);
    }

    if (!payment.subscriptionId) {
      console.error(
        `\n${colors.red}✗${colors.reset} Payment ${args.paymentId} is not a subscription payment\n`,
      );
      process.exit(1);
    }

    console.log(
      `\n${colors.blue}Simulating ${args.type} webhook...${colors.reset}\n`,
    );
    const result = await simulateWebhook(payment, args.type, args.baseUrl);

    if (result.success) {
      console.log(
        `${colors.green}✓${colors.reset} HTTP ${result.httpStatus} - ${result.message}\n`,
      );
    } else {
      console.error(
        `${colors.red}✗${colors.reset} HTTP ${result.httpStatus} - ${result.message}\n`,
      );
      process.exit(1);
    }
    process.exit(0);
  }

  // Handle --all flag
  if (args.all) {
    const payments = await getPendingSubscriptionPayments();

    if (payments.length === 0) {
      console.log(
        `\n${colors.yellow}No pending subscription payments found.${colors.reset}\n`,
      );
      process.exit(0);
    }

    console.log(
      `\n${colors.blue}Processing ${payments.length} subscription payment(s) with event: ${args.type}${colors.reset}\n`,
    );

    let successCount = 0;
    let errorCount = 0;

    for (const p of payments) {
      console.log(
        `${colors.magenta}[Subscription]${colors.reset} Payment: ${p.id}`,
      );

      const result = await simulateWebhook(p, args.type, args.baseUrl);

      if (result.success) {
        console.log(
          `  ${colors.green}✓${colors.reset} HTTP ${result.httpStatus} - ${result.message}\n`,
        );
        successCount++;
      } else {
        console.error(
          `  ${colors.red}✗${colors.reset} HTTP ${result.httpStatus} - ${result.message}\n`,
        );
        errorCount++;
      }
    }

    console.log(
      `${colors.cyan}────────────────────────────────────────────${colors.reset}`,
    );
    console.log(
      `${colors.green}Success: ${successCount}${colors.reset} | ${colors.red}Errors: ${errorCount}${colors.reset}`,
    );
    console.log(`${colors.green}Done!${colors.reset}\n`);

    process.exit(errorCount > 0 ? 1 : 0);
  }

  // Default: show pending subscription payments and plans
  const allPayments = await getPendingPaymentsWithDetails();
  const subscriptionPayments = allPayments.filter(
    (p) => p.payment.subscriptionId,
  );

  if (subscriptionPayments.length > 0) {
    printPendingPayments(subscriptionPayments);
  } else {
    console.log(
      `\n${colors.dim}No pending subscription payments found.${colors.reset}`,
    );
  }

  await listSubscriptionPlans();

  console.log(`${colors.yellow}Use --help for options.${colors.reset}\n`);
}

main().catch((error) => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
