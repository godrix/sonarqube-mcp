import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export class SonarQubePromptController {
  constructor(private server: McpServer) {
    this.registerPrompts();
  }

  private registerPrompts(): void {
    this.registerAnalyzeProjectQualityPrompt();
    this.registerGenerateQualityReportPrompt();
    this.registerPrioritizeIssuesPrompt();
  }

  private registerAnalyzeProjectQualityPrompt(): void {
    this.server.registerPrompt(
      "analyze-project-quality",
      {
        title: "Analyze Project Quality",
        description:
          "Analyzes the overall quality of a SonarQube project and provides insights",
        argsSchema: {
          projectKey: z
            .string()
            .describe("Project key to analyze. If you don't know it, use Git repository name (e.g., 'my-repo') and it will be searched automatically."),
        },
      },
      ({ projectKey }: { projectKey: string }) => ({
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Analyze the quality of project "${projectKey}" in SonarQube.

IMPORTANT: If "${projectKey}" is not a valid projectKey (format: org_project), first search for the project:
1. Use get-projects with query="${projectKey}" to find the correct projectKey
2. Git repository name usually corresponds to projectKey (e.g., "my-repo" → "org_my-repo")
3. Use the found projectKey for the following analyses

After confirming the correct projectKey, provide:

1. A general summary of code health
2. Main metrics (coverage, bugs, vulnerabilities, code smells)
3. Quality Gate status
4. Critical issues requiring immediate attention
5. Pending Security Hotspots for review
6. Trends over time (if history available)
7. Priority action recommendations

Use SonarQube MCP tools to fetch:
- get-projects (if you need to find projectKey)
- get-project-details
- get-metrics
- get-quality-gate-status
- get-issues (critical and blocker issues)
- get-hotspots (security hotspots)
- get-project-analyses (history)

Provide a complete and actionable analysis.`,
            },
          },
        ],
      })
    );
  }

  private registerGenerateQualityReportPrompt(): void {
    this.server.registerPrompt(
      "generate-quality-report",
      {
        title: "Generate Quality Report",
        description:
          "Generates a detailed code quality report for a project",
        argsSchema: {
          projectKey: z.string().describe("Project key"),
          includeIssues: z
            .boolean()
            .default(true)
            .describe("Include issues list in the report"),
        },
      },
      ({ projectKey, includeIssues }: { projectKey: string; includeIssues: boolean }) => ({
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Generate a detailed code quality report for project "${projectKey}".

The report should include:

## 1. Project Information
- Project name and key
- Last analysis date

## 2. Quality Gate Status
- Current status (PASSED/FAILED)
- Unmet conditions (if any)

## 3. Main Metrics
- Test coverage
- Number of bugs
- Number of vulnerabilities
- Number of code smells
- Maintainability rating
- Reliability rating
- Security rating
- Code duplication
- Lines of code (ncloc)

## 4. Issues Analysis${includeIssues ? `
- Total issues by severity
- Total issues by type
- Detailed list of BLOCKER and CRITICAL issues` : `
- Statistical summary of issues`}

## 5. Recommendations
- Priority actions based on data
- Improvement suggestions

Use appropriate SonarQube MCP tools to collect all necessary data and format the report clearly and professionally.`,
            },
          },
        ],
      })
    );
  }

  private registerPrioritizeIssuesPrompt(): void {
    this.server.registerPrompt(
      "prioritize-issues",
      {
        title: "Prioritize Issues",
        description:
          "Analyzes and prioritizes project issues for fixing",
        argsSchema: {
          projectKey: z.string().describe("Project key"),
          maxIssues: z
            .number()
            .default(20)
            .describe("Maximum number of issues to prioritize"),
        },
      },
      ({ projectKey, maxIssues }: { projectKey: string; maxIssues: number }) => ({
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Analyze issues from project "${projectKey}" and create a prioritized list of up to ${maxIssues} issues that should be fixed first.

Prioritization criteria:
1. Severity (BLOCKER > CRITICAL > MAJOR > MINOR > INFO)
2. Type (VULNERABILITY > BUG > CODE_SMELL > SECURITY_HOTSPOT)
3. Component/file (group issues from the same file)
4. Impact on security and reliability

For each prioritized issue, provide:
- Issue key
- Severity and type
- File and line
- Problem description
- Priority justification
- Action suggestion

Use the get-issues tool from SonarQube MCP to fetch issues and organize them clearly and actionably for the development team.`,
            },
          },
        ],
      })
    );
  }
}

