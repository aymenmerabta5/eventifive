import "dotenv/config";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { registerUserTools } from "./tools/users.js";
import { registerEventTools } from "./tools/events.js";
import { registerSubmissionTools } from "./tools/submissions.js";
import { registerReviewTools } from "./tools/reviews.js";
import { registerSeedTools } from "./tools/seed.js";

// Create server instance
const server = new McpServer({
  name: "eventifive-mcp",
  version: "1.0.0",
});

// Register all tools
registerUserTools(server);
registerEventTools(server);
registerSubmissionTools(server);
registerReviewTools(server);
registerSeedTools(server);

// Run the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Eventifive MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
