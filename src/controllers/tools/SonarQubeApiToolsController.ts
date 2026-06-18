import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { SonarQubeService } from "../../services/SonarQubeService.js";

function toolResponse(data: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

function toolError(error: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: `Error: ${error instanceof Error ? error.message : String(error)}`,
      },
    ],
    isError: true,
  };
}

export class SonarQubeApiToolsController {
  constructor(
    private server: McpServer,
    private sonarQubeService: SonarQubeService
  ) {
    this.registerTools();
  }

  private registerTools(): void {
    this.registerSearchApiEndpointsHandler();
    this.registerDescribeApiEndpointHandler();
    this.registerCallSonarApiHandler();
  }

  private registerSearchApiEndpointsHandler(): void {
    this.server.tool(
      "search-api-endpoints",
      "Search SonarQube Web API endpoints available on the connected instance. Use this to discover controllers, actions, HTTP methods, and whether an endpoint is read-only before calling it.",
      {
        query: z
          .string()
          .optional()
          .describe(
            "Optional keyword to filter endpoints (controller, action, or description). Example: 'issues search', 'qualitygates', 'hotspots'"
          ),
        includeInternals: z
          .boolean()
          .default(false)
          .describe(
            "Include internal endpoints (forward-compatibility not assured)"
          ),
      },
      async ({ query, includeInternals }) => {
        try {
          const endpoints = await this.sonarQubeService.searchApiEndpoints(
            query,
            includeInternals
          );

          return toolResponse({
            total: endpoints.length,
            readOnlyMode: this.sonarQubeService.readOnly,
            endpoints,
          });
        } catch (error) {
          return toolError(error);
        }
      }
    );
  }

  private registerDescribeApiEndpointHandler(): void {
    this.server.tool(
      "describe-api-endpoint",
      "Get full parameter documentation for a SonarQube Web API endpoint (controller + action). Always call this before call-sonar-api when you are unsure about required parameters.",
      {
        controller: z
          .string()
          .describe(
            "API controller path. Examples: 'api/issues', 'issues', 'api/projects'"
          ),
        action: z
          .string()
          .describe("API action name. Example: 'search', 'show', 'create'"),
      },
      async ({ controller, action }) => {
        try {
          const details = await this.sonarQubeService.showWebService(
            controller,
            action
          );

          const method = details.post ? "POST" : "GET";

          return toolResponse({
            controller: details.path,
            action: details.action,
            description: details.description,
            method,
            readOnlyMode: this.sonarQubeService.readOnly,
            parameters: details.params ?? [],
          });
        } catch (error) {
          return toolError(error);
        }
      }
    );
  }

  private registerCallSonarApiHandler(): void {
    const description = this.sonarQubeService.readOnly
      ? "Execute a read-only SonarQube Web API call (GET). Write operations (POST/create/update/delete) are blocked while SONARQUBE_READ_ONLY=true."
      : "Execute any SonarQube Web API call. Use search-api-endpoints and describe-api-endpoint first to discover the correct controller, action, and parameters.";

    this.server.tool(
      "call-sonar-api",
      description,
      {
        controller: z
          .string()
          .describe(
            "API controller path. Examples: 'api/issues', 'issues', 'api/components'"
          ),
        action: z.string().describe("API action name. Example: 'search'"),
        method: z
          .enum(["GET", "POST"])
          .optional()
          .describe(
            "HTTP method. If omitted, inferred from the endpoint metadata."
          ),
        params: z
          .record(z.union([z.string(), z.number(), z.boolean()]))
          .optional()
          .describe(
            "Query/body parameters as key-value pairs. Example: { \"projectKey\": \"my-project\", \"p\": 1, \"ps\": 100 }"
          ),
      },
      async ({ controller, action, method, params }) => {
        try {
          const data = await this.sonarQubeService.callApi({
            controller,
            action,
            method,
            params,
          });

          return toolResponse(data);
        } catch (error) {
          return toolError(error);
        }
      }
    );
  }
}
