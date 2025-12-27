# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2025-12-27

### Fixed
- Added `bin` field in package.json to enable npx execution
- Added shebang (`#!/usr/bin/env node`) to server.ts for proper executable handling
- Resolved "could not determine executable to run" error when executing via npx

## [1.0.0] - 2025-12-27

### Added
- Initial release of SonarQube MCP Server
- 12 analysis tools for comprehensive code quality inspection
  - `get-projects` - List and search SonarQube projects
  - `get-project-details` - Get detailed project information
  - `get-project-branches` - List analyzed branches
  - `get-issues` - Find bugs, vulnerabilities, and code smells
  - `get-hotspots` - Security hotspots requiring review
  - `get-hotspot-details` - Detailed hotspot information
  - `get-metrics` - Code quality metrics and ratings
  - `get-quality-gate-status` - Check quality gate results
  - `get-project-analyses` - Analysis history
  - `get-source-code` - View source code with line numbers
  - `get-duplications` - Find code duplication
  - `get-rule-details` - Explain violated rules
- 3 AI-powered prompts for intelligent analysis
  - `analyze-project-quality` - Complete project analysis with insights
  - `generate-quality-report` - Detailed quality report generation
  - `prioritize-issues` - Issue prioritization by severity and impact
- Smart project search by repository name
- Security analysis with hotspot detection
- Code quality metrics (coverage, bugs, code smells, duplication)
- Quality gate validation
- Branch comparison and analysis
- Source code inspection with line numbers
- Rule explanation system
- Support for both SonarCloud and SonarQube Server
- Basic authentication with automatic token conversion
- TypeScript implementation with strict mode
- Comprehensive documentation and usage examples
- MCP Inspector support for development and testing
- One-click installation badge for Cursor

### Security
- Read-only operations to prevent accidental modifications
- Token-based authentication with base64 encoding
- Environment variable configuration for sensitive data

[1.0.1]: https://github.com/godrix/sonarqube-mcp/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/godrix/sonarqube-mcp/releases/tag/v1.0.0

