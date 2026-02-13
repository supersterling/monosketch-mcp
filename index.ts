#!/usr/bin/env bun

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { registerSceneTools } from "./src/tools/scene.ts"
import { registerCanvasTools } from "./src/tools/canvas-tools.ts"
import { registerUtilityTools } from "./src/tools/utilities.ts"

// ─────────────────────────────────────────────────────────────────────────────
// Server Setup
// ─────────────────────────────────────────────────────────────────────────────

const server = new McpServer(
    { name: "monosketch", version: "1.0.0" },
    { capabilities: { tools: {} } },
)

// ─────────────────────────────────────────────────────────────────────────────
// Tools
// ─────────────────────────────────────────────────────────────────────────────

registerSceneTools(server)
registerCanvasTools(server)
registerUtilityTools(server)

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport()
await server.connect(transport)
