#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadSonarQubeConfig } from "./config/SonarQubeConfig.js";
import { SonarQubeService } from "./services/SonarQubeService.js";
import { SonarQubeToolsController } from "./controllers/tools/SonarQubeToolsController.js";
import { SonarQubeApiToolsController } from "./controllers/tools/SonarQubeApiToolsController.js";
import { SonarQubePromptController } from "./controllers/prompts/SonarQubePromptController.js";
import "dotenv/config";

async function main() {
  let config;

  try {
    config = loadSonarQubeConfig();
  } catch (error) {
    console.error(
      "ERROR:",
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }

  const server = new McpServer({
    name: "@godrix/sonarqube-mcp",
    version: "1.1.0",
  });

  let sonarQubeService: SonarQubeService;

  try {
    sonarQubeService = new SonarQubeService(config);
  } catch (error) {
    console.error(
      "Error initializing SonarQubeService:",
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }

  new SonarQubeToolsController(server, sonarQubeService);
  new SonarQubeApiToolsController(server, sonarQubeService);
  new SonarQubePromptController(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  const modeLabel = config.readOnly ? "Read-only" : "Full access";

  console.error("========================================");
  console.error("SonarQube MCP Server running");
  console.error(`URL: ${config.url}`);
  console.error(`Mode: ${modeLabel}`);
  console.error("========================================");
  console.error("");
  console.error("Analysis tools (12):");
  console.error("  get-projects, get-project-details, get-project-branches");
  console.error("  get-issues, get-hotspots, get-hotspot-details");
  console.error("  get-metrics, get-quality-gate-status, get-project-analyses");
  console.error("  get-source-code, get-duplications, get-rule-details");
  console.error("");
  console.error("Web API tools (3):");
  console.error("  search-api-endpoints - Discover available API endpoints");
  console.error("  describe-api-endpoint - Get endpoint parameters");
  console.error(
    `  call-sonar-api - Execute API calls${config.readOnly ? " (GET/read-only only)" : ""}`
  );
  console.error("");
  console.error("Prompts:");
  console.error("  analyze-project-quality, generate-quality-report, prioritize-issues");
  console.error("========================================");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
