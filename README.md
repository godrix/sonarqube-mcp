# SonarQube MCP Server

[![Install MCP Server](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en-US/install-mcp?name=Sonarqube&config=eyJjb21tYW5kIjoibnB4IC15IEBnb2RyaXgvbWNwLXNvbmFycXViZSJ9)

A Model Context Protocol (MCP) server for analyzing code quality with SonarQube. Enables AI assistants to interact with SonarQube for code analysis, quality metrics, security hotspots, and more.

## Features

- **12 Analysis Tools** - Complete set of read-only tools for code analysis
- **Smart Project Search** - Find projects by repository name
- **Security Analysis** - Security hotspots and vulnerability detection
- **Code Quality Metrics** - Coverage, bugs, code smells, duplication
- **Quality Gates** - Check if code meets quality standards
- **Branch Analysis** - Compare quality across branches
- **Source Code View** - Inspect code with line numbers
- **Rule Explanations** - Understand why issues are flagged
- **3 AI Prompts** - Intelligent analysis templates

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

Create `.env` file:

```env
SONARQUBE_URL=https://sonarcloud.io
SONARQUBE_TOKEN=your_token_here
```

**Get your token:**
- **SonarCloud**: https://sonarcloud.io → Account → Security → Generate Tokens
- **SonarQube Server**: Administration → Security → Users → Generate Token

### 3. Build

```bash
npm run build
```

### 4. Configure MCP Client

Add to your MCP client configuration (e.g., Claude Desktop):

**macOS/Linux** (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "sonarqube": {
      "command": "node",
      "args": ["/absolute/path/build/server.js"],
      "env": {
        "SONARQUBE_URL": "https://sonarcloud.io",
        "SONARQUBE_TOKEN": "your_token_here"
      }
    }
  }
}
```

### 5. Restart MCP Client

Restart Claude Desktop (or your MCP client) to load the server.

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

This conversion happens automatically - just provide your token in the `.env` file.

## Finding Project Keys

SonarQube uses `projectKey` to identify projects. Format is usually:

```
organization_repository-name
```

### Method 1: Search by Repository Name (Recommended)

```
"Find projects named 'my-repo'"
"Analyze project 'backend-api'"
```

The AI will automatically:
1. Search using `get-projects` with query
2. Find the correct projectKey
3. Use it for analysis

### Method 2: List All Projects

```
"List all SonarQube projects"
```

Then use the projectKey from results.

### Method 3: Check Local Files

Check these files in your repository:
- `sonar-project.properties` → `sonar.projectKey=...`
- `package.json` → `sonarqube.projectKey`
- `pom.xml` → `<sonar.projectKey>...</sonar.projectKey>`
- `build.gradle` → `property "sonar.projectKey", "..."`

## Available Tools

### Projects & Overview (3)
1. **get-projects** - List projects (supports search query)
2. **get-project-details** - Get project information
3. **get-project-branches** - List analyzed branches

### Issues & Security (3)
4. **get-issues** - Find bugs, vulnerabilities, code smells
5. **get-hotspots** - Security hotspots requiring review
6. **get-hotspot-details** - Detailed hotspot information

### Quality & Metrics (3)
7. **get-metrics** - Code quality metrics
8. **get-quality-gate-status** - Check if quality gate passed
9. **get-project-analyses** - Analysis history

### Code Inspection (3)
10. **get-source-code** - View source code with line numbers
11. **get-duplications** - Find code duplication
12. **get-rule-details** - Explain violated rules

## AI Prompts

### 1. analyze-project-quality
Complete project analysis with insights and recommendations.

```
"Analyze project quality for 'my-repo'"
```

### 2. generate-quality-report
Generate detailed quality report.

```
"Generate quality report for project 'backend-api'"
```

### 3. prioritize-issues
Prioritize issues by severity and impact.

```
"Prioritize issues for project 'frontend'"
```

## Usage Examples

### Basic Analysis
```
"Show critical bugs in project 'my-app'"
"What's the code coverage of 'backend-service'?"
"Did project 'frontend' pass the quality gate?"
```

### Branch Analysis
```
"Analyze issues in branch feature/new-feature"
"Compare quality between develop and main branches"
```

### Security Review
```
"Show unreviewed security hotspots"
"Explain hotspot ABC-123 in detail"
"Security vulnerabilities in new code"
```

### Code Review
```
"Show code where bug is on line 45"
"Find code duplications in UserService.java"
"Explain why rule java:S1144 was violated"
```

### Refactoring
```
"Which files have most code duplication?"
"Show refactoring opportunities"
"Identify code smells to clean up"
```

## Development

### Test with MCP Inspector

```bash
npm run dev
```

This opens the MCP Inspector for interactive testing.

### Project Structure

```
@godrix/mcp-sonarqube/
├── src/
│   ├── server.ts                          # Main server
│   ├── services/
│   │   └── SonarQubeService.ts            # API integration
│   ├── controllers/
│   │   ├── tools/
│   │   │   └── SonarQubeToolsController.ts  # MCP tools
│   │   └── prompts/
│   │       └── SonarQubePromptController.ts # MCP prompts
│   └── model/
│       └── SonarQube.ts                   # TypeScript types
├── build/                                  # Compiled JavaScript
├── package.json
├── tsconfig.json
└── .env                                    # Configuration (not versioned)
```

## Tool Reference

### get-projects
List SonarQube projects with optional search.

**Parameters:**
- `query` (optional) - Search by repository name
- `page` (optional) - Page number (default: 1)
- `pageSize` (optional) - Items per page (default: 100)

### get-issues
Search for code issues.

**Parameters:**
- `projectKey` (required) - Project identifier
- `branch` (optional) - Specific branch
- `severities` (optional) - Filter: BLOCKER, CRITICAL, MAJOR, MINOR, INFO
- `types` (optional) - Filter: BUG, VULNERABILITY, CODE_SMELL, SECURITY_HOTSPOT
- `issueStatuses` (optional) - Filter: OPEN, CONFIRMED, FALSE_POSITIVE, ACCEPTED, FIXED
- `createdAfter` (optional) - Date filter (YYYY-MM-DD)
- `createdBefore` (optional) - Date filter (YYYY-MM-DD)
- `assignees` (optional) - Filter by assignee (__me__ for current user)
- `tags` (optional) - Filter by tags

### get-metrics
Get code quality metrics.

**Parameters:**
- `projectKey` (required) - Project identifier
- `metricKeys` (required) - Array of metric names

**Common metrics:**
- `coverage` - Test coverage
- `bugs` - Number of bugs
- `vulnerabilities` - Number of vulnerabilities
- `code_smells` - Number of code smells
- `sqale_rating` - Maintainability rating (A-E)
- `reliability_rating` - Reliability rating (A-E)
- `security_rating` - Security rating (A-E)
- `duplicated_lines_density` - Duplication percentage
- `ncloc` - Lines of code (non-comment)

### get-hotspots
Find security hotspots.

**Parameters:**
- `projectKey` (required) - Project identifier
- `branch` (optional) - Specific branch
- `status` (optional) - TO_REVIEW or REVIEWED
- `resolution` (optional) - FIXED, SAFE, or ACKNOWLEDGED
- `inNewCodePeriod` (optional) - Filter new code only

### get-source-code
View source code with line numbers.

**Parameters:**
- `fileKey` (required) - File identifier (format: `project:path/to/file`)
- `from` (optional) - Start line
- `to` (optional) - End line

### get-rule-details
Get detailed rule information.

**Parameters:**
- `ruleKey` (required) - Rule identifier (format: `language:ruleId`)

## Troubleshooting

### Token Not Working
- Verify token is complete and correct
- Check token has Browse permission
- Generate new token if needed

### Project Not Found
- Verify projectKey is correct
- Use `get-projects` with query to find it
- Check you have access in SonarQube

### Connection Errors
- Verify SONARQUBE_URL is correct
- For local server, ensure it's running
- Check firewall settings

## Security

- ✅ Read-only operations (no modifications)
- ✅ Token stored in `.env` (not versioned)
- ✅ Basic Auth with base64 encoding
- ⚠️ Never commit `.env` file
- ⚠️ Use tokens with minimum required permissions

## API Rate Limits

Be aware of API rate limits:
- **SonarCloud**: Check your organization's limits
- **SonarQube Server**: Depends on server configuration

## License

MIT

## Contributing

Contributions welcome! Please ensure:
- TypeScript strict mode compliance
- English comments and documentation
- Tests for new features
- Update README for new tools

## Links

- [SonarQube Web API](https://docs.sonarqube.org/latest/extend/web-api/)
- [SonarCloud](https://sonarcloud.io)
- [Model Context Protocol](https://github.com/modelcontextprotocol/sdk)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)

---

Built with ❤️ using Model Context Protocol
