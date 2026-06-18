# SonarQube MCP Server

[![Install MCP Server](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en-US/install-mcp?name=Sonarqube&config=eyJlbnYiOnsiU09OQVJRVUJFX1VSTCI6Imh0dHBzOi8vc29uYXJjbG91ZC5pbyIsIlNPTkFSUVVCRV9UT0tFTiI6InlvdXJfdG9rZW5faGVyZSIsIlNPTkFSUVVCRV9SRUFEX09OTFkiOiJmYWxzZSJ9LCJjb21tYW5kIjoibnB4IC15IEBnb2RyaXgvbWNwL3NvbmFycXViZSJ9)

A Model Context Protocol (MCP) server for SonarQube integration. Enables AI assistants to analyze code quality, explore the full SonarQube Web API, and interact with metrics, issues, hotspots, and more.

## Features

- **15 MCP Tools** — 12 high-level analysis tools + 3 generic Web API tools
- **Full API Coverage** — Discover and call any endpoint exposed by your SonarQube instance
- **Read-only Mode** — Optional `SONARQUBE_READ_ONLY` flag to block write operations
- **Smart Project Search** — Find projects by repository name
- **Security Analysis** — Security hotspots and vulnerability detection
- **Code Quality Metrics** — Coverage, bugs, code smells, duplication
- **Quality Gates** — Check if code meets quality standards
- **Branch Analysis** — Compare quality across branches
- **3 AI Prompts** — Intelligent analysis templates

## Prerequisites

- Node.js 18+
- SonarQube account (SonarCloud or SonarQube Server)
- SonarQube authentication token

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env` file (see `.env.example`):

```env
SONARQUBE_URL=https://sonarcloud.io
SONARQUBE_TOKEN=your_token_here
SONARQUBE_READ_ONLY=false
```

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SONARQUBE_URL` | No | `https://sonarcloud.io` | SonarQube or SonarCloud base URL |
| `SONARQUBE_TOKEN` | **Yes** | — | Authentication token |
| `SONARQUBE_READ_ONLY` | No | `false` | When `true`, blocks write operations via `call-sonar-api` |

**Get your token:**
- **SonarCloud**: https://sonarcloud.io → Account → Security → Generate Tokens
- **SonarQube Server**: Administration → Security → Users → Generate Token

### 3. Build

```bash
npm run build
```

### 4. Configure MCP Client

Add to your MCP client configuration (e.g., Claude Desktop or Cursor):

**macOS/Linux** (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "sonarqube": {
      "command": "node",
      "args": ["/absolute/path/build/server.js"],
      "env": {
        "SONARQUBE_URL": "https://sonarcloud.io",
        "SONARQUBE_TOKEN": "your_token_here",
        "SONARQUBE_READ_ONLY": "false"
      }
    }
  }
}
```

**Read-only example** (safe for exploration, no mutations):

```json
{
  "env": {
    "SONARQUBE_URL": "https://sonarcloud.io",
    "SONARQUBE_TOKEN": "your_token_here",
    "SONARQUBE_READ_ONLY": "true"
  }
}
```

### 5. Restart MCP Client

Restart your MCP client to load the server.

## Authentication

The server uses **Basic Authentication** with automatic token conversion:

```
Your token:  squ_abc123...
  ↓
Add colon:   squ_abc123...:
  ↓
Base64:      c3F1X2FiYzEyMy4uLjo=
  ↓
Header:      Authorization: Basic c3F1X2FiYzEyMy4uLjo=
```

This conversion happens automatically — just provide your token in the environment.

## Available Tools

### Analysis Tools (12) — always read-only

| Tool | Description |
|------|-------------|
| `get-projects` | List projects (supports search query) |
| `get-project-details` | Get project information |
| `get-project-branches` | List analyzed branches |
| `get-issues` | Find bugs, vulnerabilities, code smells |
| `get-hotspots` | Security hotspots requiring review |
| `get-hotspot-details` | Detailed hotspot information |
| `get-metrics` | Code quality metrics |
| `get-quality-gate-status` | Check if quality gate passed |
| `get-project-analyses` | Analysis history |
| `get-source-code` | View source code with line numbers |
| `get-duplications` | Find code duplication |
| `get-rule-details` | Explain violated rules |

### Web API Tools (3) — full SonarQube API access

These tools use SonarQube's built-in `/api/webservices` discovery to expose **every endpoint** available on your instance (issues, projects, quality gates, webhooks, permissions, etc.).

| Tool | Description |
|------|-------------|
| `search-api-endpoints` | Discover available API endpoints by keyword |
| `describe-api-endpoint` | Get parameters and HTTP method for an endpoint |
| `call-sonar-api` | Execute any API call (GET/POST) |

**Recommended workflow:**

```
1. search-api-endpoints  →  find "issues search"
2. describe-api-endpoint →  learn required params (projectKey, severities, ...)
3. call-sonar-api        →  execute the call
```

**Example — search issues via generic API:**

```json
{
  "controller": "api/issues",
  "action": "search",
  "params": {
    "projects": "my-project-key",
    "severities": "CRITICAL,BLOCKER",
    "ps": 50
  }
}
```

**Example — assign issue (requires `SONARQUBE_READ_ONLY=false`):**

```json
{
  "controller": "api/issues",
  "action": "assign",
  "method": "POST",
  "params": {
    "issue": "AU-Tpxb--iU5OvuD2FLy",
    "assignee": "john.doe"
  }
}
```

### Read-only Mode Behavior

When `SONARQUBE_READ_ONLY=true`:

- All 12 analysis tools work normally (they are always read-only)
- `search-api-endpoints` and `describe-api-endpoint` work normally
- `call-sonar-api` **blocks** POST and mutation GET endpoints (create, update, delete, assign, etc.)

When `SONARQUBE_READ_ONLY=false` (default):

- Full API access including write operations

## AI Prompts

| Prompt | Description |
|--------|-------------|
| `analyze-project-quality` | Complete project analysis with insights |
| `generate-quality-report` | Detailed quality report |
| `prioritize-issues` | Prioritize issues by severity and impact |

## Usage Examples

### Code Quality Analysis

```
"Show critical bugs in project 'my-app'"
"What's the code coverage of 'backend-service'?"
"Did project 'frontend' pass the quality gate?"
```

### Explore SonarQube API

```
"List all SonarQube API endpoints related to quality gates"
"Show parameters for api/issues/search"
"Call api/projects/search with query=my-repo"
```

### Security Review

```
"Show unreviewed security hotspots"
"Explain hotspot ABC-123 in detail"
```

## Development

### Test with MCP Inspector

```bash
npm run dev
```

### Project Structure

```
@godrix/mcp/sonarqube/
├── src/
│   ├── server.ts                              # Main server
│   ├── config/
│   │   └── SonarQubeConfig.ts                 # Environment config
│   ├── services/
│   │   └── SonarQubeService.ts                # API integration
│   ├── controllers/
│   │   ├── tools/
│   │   │   ├── SonarQubeToolsController.ts    # Analysis tools
│   │   │   └── SonarQubeApiToolsController.ts # Generic Web API tools
│   │   └── prompts/
│   │       └── SonarQubePromptController.ts   # MCP prompts
│   └── model/
│       ├── SonarQube.ts                       # Domain types
│       └── SonarQubeApi.ts                    # Web API types
├── build/                                      # Compiled JavaScript
├── .env.example
├── package.json
└── tsconfig.json
```

## Troubleshooting

### Token Not Working
- Verify token is complete and correct
- Check token has Browse permission
- Generate new token if needed

### Project Not Found
- Verify projectKey is correct
- Use `get-projects` with query to find it
- Check you have access in SonarQube

### Operation Blocked in Read-only Mode
- Set `SONARQUBE_READ_ONLY=false` to enable write operations
- Or use a token with only Browse permission for extra safety

### Connection Errors
- Verify `SONARQUBE_URL` is correct
- For local server, ensure it's running
- Check firewall settings

## Security

- Read-only mode available via `SONARQUBE_READ_ONLY=true`
- Token stored in environment (not versioned)
- Basic Auth with base64 encoding
- Never commit `.env` file
- Use tokens with minimum required permissions

## License

MIT

## Links

- [SonarQube Web API](https://docs.sonarqube.org/latest/extend/web-api/)
- [SonarCloud](https://sonarcloud.io)
- [Model Context Protocol](https://github.com/modelcontextprotocol/sdk)
