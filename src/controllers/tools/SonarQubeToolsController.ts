import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { SonarQubeService } from "../../services/SonarQubeService.js";

export class SonarQubeToolsController {
  constructor(
    private server: McpServer,
    private sonarQubeService: SonarQubeService
  ) {
    this.registerTools();
  }

  private registerTools(): void {
    this.registerGetProjectsHandler();
    this.registerGetProjectDetailsHandler();
    this.registerGetIssuesHandler();
    this.registerGetMetricsHandler();
    this.registerGetQualityGateStatusHandler();
    this.registerGetProjectAnalysesHandler();
    this.registerGetHotspotsHandler();
    this.registerGetHotspotDetailsHandler();
    this.registerGetDuplicationsHandler();
    this.registerGetSourceCodeHandler();
    this.registerGetRuleDetailsHandler();
    this.registerGetProjectBranchesHandler();
  }

  private registerGetProjectsHandler(): void {
    this.server.tool(
      "get-projects",
      "List all available projects in SonarQube. Use 'query' parameter to search by Git repository name (e.g., 'my-repo' will find 'org_my-repo').",
      {
        page: z.number().min(1).default(1).describe("Page number"),
        pageSize: z
          .number()
          .min(1)
          .max(500)
          .default(100)
          .describe("Items per page"),
        query: z
          .string()
          .optional()
          .describe("Search projects by name. Use Git repository name (e.g., 'my-repo') to find projectKey automatically. SonarQube usually uses format 'organization_repo-name'."),
      },
      async ({ page, pageSize, query }) => {
        try {
          const data = await this.sonarQubeService.getProjects(page, pageSize, query);

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Error: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  private registerGetProjectDetailsHandler(): void {
    this.server.tool(
      "get-project-details",
      "Get details of a specific SonarQube project",
      {
        projectKey: z
          .string()
          .describe("Project key (e.g., 'my-project-key')"),
      },
      async ({ projectKey }) => {
        try {
          const data = await this.sonarQubeService.getProjectDetails(
            projectKey
          );

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Error: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  private registerGetIssuesHandler(): void {
    this.server.tool(
      "get-issues",
      "Search issues (code problems) in a SonarQube project. Supports advanced filters by severity, type, status, branch, dates, and more. If you don't know the projectKey, use get-projects with repository name first.",
      {
        projectKey: z
          .string()
          .describe("Project key (e.g., 'my-project-key')"),
        severities: z
          .array(z.enum(["BLOCKER", "CRITICAL", "MAJOR", "MINOR", "INFO"]))
          .optional()
          .describe(
            "Filter by severities (BLOCKER, CRITICAL, MAJOR, MINOR, INFO)"
          ),
        types: z
          .array(z.enum(["BUG", "VULNERABILITY", "CODE_SMELL", "SECURITY_HOTSPOT"]))
          .optional()
          .describe("Filter by types (BUG, VULNERABILITY, CODE_SMELL, SECURITY_HOTSPOT)"),
        statuses: z
          .array(
            z.enum([
              "OPEN",
              "CONFIRMED",
              "REOPENED",
              "RESOLVED",
              "CLOSED",
              "TO_REVIEW",
              "IN_REVIEW",
              "REVIEWED",
            ])
          )
          .optional()
          .describe("Filter by old status (deprecated, use issueStatuses)"),
        issueStatuses: z
          .array(
            z.enum([
              "OPEN",
              "CONFIRMED",
              "FALSE_POSITIVE",
              "ACCEPTED",
              "FIXED",
            ])
          )
          .optional()
          .describe("Filter by issue status (OPEN, CONFIRMED, FALSE_POSITIVE, ACCEPTED, FIXED)"),
        branch: z
          .string()
          .optional()
          .describe("Specific branch (e.g., 'develop', 'feature/my-branch')"),
        createdAfter: z
          .string()
          .optional()
          .describe("Issues created after this date (format: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)"),
        createdBefore: z
          .string()
          .optional()
          .describe("Issues created before this date (format: YYYY-MM-DD)"),
        assignees: z
          .array(z.string())
          .optional()
          .describe("List of assignees (logins). Use '__me__' for current user"),
        tags: z
          .array(z.string())
          .optional()
          .describe("Filter by tags (e.g., ['security', 'bug'])"),
        page: z.number().min(1).default(1).describe("Page number"),
        pageSize: z
          .number()
          .min(1)
          .max(500)
          .default(100)
          .describe("Items per page"),
      },
      async ({ 
        projectKey, 
        severities, 
        types, 
        statuses, 
        issueStatuses,
        branch,
        createdAfter,
        createdBefore,
        assignees,
        tags,
        page, 
        pageSize 
      }) => {
        try {
          const data = await this.sonarQubeService.getIssues(projectKey, {
            severities,
            types,
            statuses,
            issueStatuses,
            branch,
            createdAfter,
            createdBefore,
            assignees,
            tags,
            page,
            pageSize,
          });

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Error: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  private registerGetMetricsHandler(): void {
    this.server.tool(
      "get-metrics",
      "Get code quality metrics for a project",
      {
        projectKey: z
          .string()
          .describe("Project key (e.g., 'my-project-key')"),
        metricKeys: z
          .array(z.string())
          .describe(
            "List of metrics to fetch (e.g., ['coverage', 'bugs', 'vulnerabilities', 'code_smells', 'sqale_rating', 'reliability_rating', 'security_rating', 'duplicated_lines_density', 'ncloc'])"
          ),
      },
      async ({ projectKey, metricKeys }) => {
        try {
          const data = await this.sonarQubeService.getMetrics(
            projectKey,
            metricKeys
          );

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Error: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  private registerGetQualityGateStatusHandler(): void {
    this.server.tool(
      "get-quality-gate-status",
      "Get Quality Gate status for a project",
      {
        projectKey: z
          .string()
          .describe("Project key (e.g., 'my-project-key')"),
      },
      async ({ projectKey }) => {
        try {
          const data = await this.sonarQubeService.getQualityGateStatus(
            projectKey
          );

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Error: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  private registerGetProjectAnalysesHandler(): void {
    this.server.tool(
      "get-project-analyses",
      "Get project analysis history in SonarQube",
      {
        projectKey: z
          .string()
          .describe("Project key (e.g., 'my-project-key')"),
        page: z.number().min(1).default(1).describe("Page number"),
        pageSize: z
          .number()
          .min(1)
          .max(500)
          .default(100)
          .describe("Items per page"),
      },
      async ({ projectKey, page, pageSize }) => {
        try {
          const data = await this.sonarQubeService.getProjectAnalyses(
            projectKey,
            page,
            pageSize
          );

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Error: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  private registerGetHotspotsHandler(): void {
    this.server.tool(
      "get-hotspots",
      "Search Security Hotspots (security attention points) in a project. Hotspots require manual review to determine if they are real vulnerabilities.",
      {
        projectKey: z
          .string()
          .describe("Project key (e.g., 'my-project-key')"),
        branch: z
          .string()
          .optional()
          .describe("Specific branch (e.g., 'develop', 'feature/xyz')"),
        status: z
          .enum(["TO_REVIEW", "REVIEWED"])
          .optional()
          .describe("Hotspot status: TO_REVIEW (to review) or REVIEWED (reviewed)"),
        resolution: z
          .enum(["FIXED", "SAFE", "ACKNOWLEDGED"])
          .optional()
          .describe("Resolution (only for REVIEWED status): FIXED, SAFE, or ACKNOWLEDGED"),
        inNewCodePeriod: z
          .boolean()
          .optional()
          .describe("Filter only hotspots in new code period"),
        onlyMine: z
          .boolean()
          .optional()
          .describe("Filter only hotspots assigned to me"),
        files: z
          .array(z.string())
          .optional()
          .describe("List of specific files to filter"),
        page: z.number().min(1).default(1).describe("Page number"),
        pageSize: z
          .number()
          .min(1)
          .max(500)
          .default(100)
          .describe("Items per page"),
      },
      async ({
        projectKey,
        branch,
        status,
        resolution,
        inNewCodePeriod,
        onlyMine,
        files,
        page,
        pageSize,
      }) => {
        try {
          const data = await this.sonarQubeService.getHotspots(projectKey, {
            branch,
            status,
            resolution,
            inNewCodePeriod,
            onlyMine,
            files,
            page,
            pageSize,
          });

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Error: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  private registerGetHotspotDetailsHandler(): void {
    this.server.tool(
      "get-hotspot-details",
      "Get complete details of a specific Security Hotspot, including description, code location, and recommendations.",
      {
        hotspotKey: z
          .string()
          .describe("Security Hotspot key (e.g., 'AWhXpLoInp4On-Y3xc8x')"),
      },
      async ({ hotspotKey }) => {
        try {
          const data = await this.sonarQubeService.getHotspotDetails(hotspotKey);

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Error: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  private registerGetDuplicationsHandler(): void {
    this.server.tool(
      "get-duplications",
      "Search duplicate code blocks in a file. Helps identify refactoring opportunities.",
      {
        fileKey: z
          .string()
          .describe(
            "File key (e.g., 'my-project:src/main/java/com/example/MyClass.java')"
          ),
      },
      async ({ fileKey }) => {
        try {
          const data = await this.sonarQubeService.getDuplications(fileKey);

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Error: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  private registerGetSourceCodeHandler(): void {
    this.server.tool(
      "get-source-code",
      "Get source code of a file with line numbers. Useful to see context of issues and hotspots.",
      {
        fileKey: z
          .string()
          .describe(
            "File key (e.g., 'my-project:src/main/java/com/example/MyClass.java')"
          ),
        from: z
          .number()
          .min(1)
          .optional()
          .describe("Start line (starting at 1)"),
        to: z
          .number()
          .min(1)
          .optional()
          .describe("End line (inclusive)"),
      },
      async ({ fileKey, from, to }) => {
        try {
          const data = await this.sonarQubeService.getSourceCode(fileKey, from, to);

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Error: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  private registerGetRuleDetailsHandler(): void {
    this.server.tool(
      "get-rule-details",
      "Get detailed information about a SonarQube rule, including description, examples, and how to fix.",
      {
        ruleKey: z
          .string()
          .describe(
            "Rule key (e.g., 'java:S1144', 'javascript:S1234'). Format: language:ruleId"
          ),
      },
      async ({ ruleKey }) => {
        try {
          const data = await this.sonarQubeService.getRuleDetails(ruleKey);

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Error: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  private registerGetProjectBranchesHandler(): void {
    this.server.tool(
      "get-project-branches",
      "List all analyzed branches of a project, with information about the last analysis of each one.",
      {
        projectKey: z
          .string()
          .describe("Project key (e.g., 'my-project-key')"),
      },
      async ({ projectKey }) => {
        try {
          const data = await this.sonarQubeService.getProjectBranches(projectKey);

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Error: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
            isError: true,
          };
        }
      }
    );
  }
}

