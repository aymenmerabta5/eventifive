#!/usr/bin/env bun
/**
 * CLI script for testing Chargily webhooks
 *
 * Usage:
 *   bun run test:events                                    # List pending payments
 *   bun run test:events -- --payment-id <id>               # Simulate for specific payment
 *   bun run test:events -- --user-id <id> --event-id <id>  # Create + simulate for user/event
 *   bun run test:events -- --list-events                   # List paid events
 *   bun run test:events -- --list-users                    # List users
 */

import {
  colors,
  type WebhookEventType,
  getPendingPaymentsWithDetails,
  getPaymentById,
  getPendingPaymentsByUserId,
  getPendingPaymentsByEventId,
  getPendingSubscriptionPayments,
  getPendingRegistrationPayments,
  printPendingPayments,
  simulateWebhook,
  createTestRegistrationPayment,
  createTestSubscriptionPayment,
  listPaidEvents,
  listUsers,
  type PaymentRecord,
} from "@/server/tests";

interface CliArgs {
  paymentId?: string;
  userId?: string;
  eventId?: string;
  priceId?: string;
  subscription?: boolean;
  registration?: boolean;
  type: WebhookEventType;
  baseUrl?: string;
  all: boolean;
  listEvents: boolean;
  listUsersFlag: boolean;
  create: boolean;
  help: boolean;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  const result: CliArgs = {
    type: "checkout.paid",
    all: false,
    listEvents: false,
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
      case "--event-id":
        result.eventId = args[++i];
        break;
      case "--price-id":
        result.priceId = args[++i];
        break;
      case "--subscription":
        result.subscription = true;
        break;
      case "--registration":
        result.registration = true;
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
      case "--list-events":
        result.listEvents = true;
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
${colors.cyan}Chargily Webhook Test Script${colors.reset}

Simulates Chargily webhook calls for testing payment flows.
Useful because Chargily doesn't invoke webhooks in test mode.

${colors.yellow}Usage:${colors.reset}
  bun run test:webhook [options]

${colors.yellow}Options:${colors.reset}
  --payment-id <id>    Simulate webhook for a specific payment ID
  --user-id <id>       User ID (combine with --event-id to create + simulate)
  --event-id <id>      Event ID (combine with --user-id to create + simulate)
  --price-id <id>      Subscription price ID (combine with --user-id for subscription)
  --subscription       Process pending subscription payments only
  --registration       Process pending registration payments only
  --type <type>        Webhook event type: paid (default), failed, expired
  --url <url>          Base URL for webhook (default: BETTER_AUTH_URL or localhost:3000)
  --all                Process ALL pending payments (use with caution)
  --list-events        List available paid events
  --list-users         List available users
  --create             Create test payment only (don't simulate webhook)
  --help, -h           Show this help message

${colors.yellow}Examples:${colors.reset}
  ${colors.dim}# List all pending payments${colors.reset}
  bun run test:webhook

  ${colors.dim}# List paid events and users${colors.reset}
  bun run test:webhook -- --list-events
  bun run test:webhook -- --list-users

  ${colors.dim}# Create + simulate paid webhook for user registering to event${colors.reset}
  bun run test:webhook -- --user-id abc123 --event-id evt_456

  ${colors.dim}# Create test payment only (no webhook simulation)${colors.reset}
  bun run test:webhook -- --user-id abc123 --event-id evt_456 --create

  ${colors.dim}# Simulate for a specific existing payment${colors.reset}
  bun run test:webhook -- --payment-id pay_789

  ${colors.dim}# Simulate failed payment${colors.reset}
  bun run test:webhook -- --payment-id pay_789 --type failed
`);
}

async function getPaymentsToProcess(args: CliArgs): Promise<PaymentRecord[]> {
  if (args.paymentId) {
    const p = await getPaymentById(args.paymentId);
    return p ? [p] : [];
  }

  if (args.subscription) {
    return getPendingSubscriptionPayments();
  }

  if (args.registration) {
    return getPendingRegistrationPayments();
  }

  if (args.all) {
    const all = await getPendingPaymentsWithDetails();
    return all.map((p) => p.payment);
  }

  return [];
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
  console.log(`${colors.cyan}  Chargily Webhook Test Script${colors.reset}`);
  console.log(
    `${colors.cyan}═══════════════════════════════════════════${colors.reset}`,
  );

  // Handle list commands
  if (args.listEvents) {
    await listPaidEvents();
    process.exit(0);
  }

  if (args.listUsersFlag) {
    await listUsers();
    process.exit(0);
  }

  // Handle create + simulate for user + event
  if (args.userId && args.eventId) {
    console.log(`\n${colors.blue}Creating test registration payment...${colors.reset}\n`);

    const createResult = await createTestRegistrationPayment(args.userId, args.eventId);

    if (!createResult.success) {
      console.error(`${colors.red}✗${colors.reset} ${createResult.message}\n`);
      process.exit(1);
    }

    if (args.create) {
      console.log(`\n${colors.green}Done!${colors.reset} Use --payment-id ${createResult.paymentId} to simulate webhook.\n`);
      process.exit(0);
    }

    // Simulate webhook
    console.log(`\n${colors.blue}Simulating webhook...${colors.reset}\n`);
    const payment = await getPaymentById(createResult.paymentId!);
    if (!payment) {
      console.error(`${colors.red}✗${colors.reset} Payment not found after creation\n`);
      process.exit(1);
    }

    const result = await simulateWebhook(payment, args.type, args.baseUrl);
    if (result.success) {
      console.log(`${colors.green}✓${colors.reset} HTTP ${result.httpStatus} - ${result.message}\n`);
    } else {
      console.error(`${colors.red}✗${colors.reset} HTTP ${result.httpStatus} - ${result.message}\n`);
      process.exit(1);
    }
    process.exit(0);
  }

  // Handle create + simulate for user + subscription price
  if (args.userId && args.priceId) {
    console.log(`\n${colors.blue}Creating test subscription payment...${colors.reset}\n`);

    const createResult = await createTestSubscriptionPayment(args.userId, args.priceId);

    if (!createResult.success) {
      console.error(`${colors.red}✗${colors.reset} ${createResult.message}\n`);
      process.exit(1);
    }

    if (args.create) {
      console.log(`\n${colors.green}Done!${colors.reset} Use --payment-id ${createResult.paymentId} to simulate webhook.\n`);
      process.exit(0);
    }

    // Simulate webhook
    console.log(`\n${colors.blue}Simulating webhook...${colors.reset}\n`);
    const payment = await getPaymentById(createResult.paymentId!);
    if (!payment) {
      console.error(`${colors.red}✗${colors.reset} Payment not found after creation\n`);
      process.exit(1);
    }

    const result = await simulateWebhook(payment, args.type, args.baseUrl);
    if (result.success) {
      console.log(`${colors.green}✓${colors.reset} HTTP ${result.httpStatus} - ${result.message}\n`);
    } else {
      console.error(`${colors.red}✗${colors.reset} HTTP ${result.httpStatus} - ${result.message}\n`);
      process.exit(1);
    }
    process.exit(0);
  }

  // If no specific action, check for payments to process
  const hasFilter =
    args.paymentId ||
    args.subscription ||
    args.registration ||
    args.all;

  if (!hasFilter) {
    const payments = await getPendingPaymentsWithDetails();
    printPendingPayments(payments);
    console.log(
      `${colors.yellow}No filter specified.${colors.reset} Use --help for options.\n`,
    );
    process.exit(0);
  }

  const payments = await getPaymentsToProcess(args);

  if (payments.length === 0) {
    console.log(
      `\n${colors.yellow}No pending payments found matching criteria.${colors.reset}\n`,
    );
    process.exit(0);
  }

  console.log(
    `\n${colors.blue}Processing ${payments.length} payment(s) with event: ${args.type}${colors.reset}\n`,
  );

  let successCount = 0;
  let errorCount = 0;

  for (const p of payments) {
    const type = p.subscriptionId ? "Subscription" : "Registration";
    console.log(`${colors.yellow}[${type}]${colors.reset} Payment: ${p.id}`);

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

  console.log(`${colors.cyan}────────────────────────────────────────────${colors.reset}`);
  console.log(
    `${colors.green}Success: ${successCount}${colors.reset} | ${colors.red}Errors: ${errorCount}${colors.reset}`,
  );
  console.log(`${colors.green}Done!${colors.reset}\n`);

  process.exit(errorCount > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
