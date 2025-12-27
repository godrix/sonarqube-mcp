#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SonarQubeService } from "./services/SonarQubeService.js";
import { SonarQubeToolsController } from "./controllers/tools/SonarQubeToolsController.js";
import { SonarQubePromptController } from "./controllers/prompts/SonarQubePromptController.js";
import "dotenv/config";

async function main() {
  // Validate environment variables
  if (!process.env.SONARQUBE_URL) {
    console.error(
      "WARNING: SONARQUBE_URL not configured. Using https://sonarcloud.io as default."
    );
  }

  if (!process.env.SONARQUBE_TOKEN) {
    console.error(
      "ERROR: SONARQUBE_TOKEN not configured. Set environment variable."
    );
    process.exit(1);
  }

  // Create MCP server
  const server = new McpServer({
    name: "@godrix/mcp-sonarqube",
    version: "1.0.0",
  });

  // Initialize services
  let sonarQubeService: SonarQubeService;
  
  try {
    sonarQubeService = new SonarQubeService();
  } catch (error) {
    console.error(
      "Error initializing SonarQubeService:",
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }

  // Register tool controllers
  new SonarQubeToolsController(server, sonarQubeService);
  console.error("✓ SonarQube Tools registered");

  // Register prompt controllers
  new SonarQubePromptController(server);
  console.error("✓ SonarQube Prompts registered");

  // Connect server via stdio
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("========================================");
  console.error("🚀 SonarQube MCP Server running!");
  console.error(`📍 URL: ${process.env.SONARQUBE_URL}`);
  console.error("🎯 Mode: Analysis (read-only)");
  console.error("========================================");
  console.error("");
  console.error("📊 Analysis Tools:");
  console.error("  • get-projects - List projects");
  console.error("  • get-project-details - Project details");
  console.error("  • get-project-branches - Analyzed branches");
  console.error("");
  console.error("🐛 Issues & Hotspots:");
  console.error("  • get-issues - Bugs, vulnerabilities, code smells");
  console.error("  • get-hotspots - Security hotspots");
  console.error("  • get-hotspot-details - Hotspot details");
  console.error("");
  console.error("📈 Metrics & Quality:");
  console.error("  • get-metrics - Quality metrics");
  console.error("  • get-quality-gate-status - Quality Gate status");
  console.error("  • get-project-analyses - Analysis history");
  console.error("");
  console.error("💻 Source Code:");
  console.error("  • get-source-code - View code with line numbers");
  console.error("  • get-duplications - Code duplication blocks");
  console.error("  • get-rule-details - Violated rule details");
  console.error("");
  console.error("💡 Prompts:");
  console.error("  • analyze-project-quality - Complete analysis");
  console.error("  • generate-quality-report - Detailed report");
  console.error("  • prioritize-issues - Issue prioritization");
  console.error("========================================");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});

