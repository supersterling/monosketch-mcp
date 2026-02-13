#!/usr/bin/env bun

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { z } from "zod"

// ─────────────────────────────────────────────────────────────────────────────
// Server Setup
// ─────────────────────────────────────────────────────────────────────────────

const server = new McpServer(
    { name: "monosketch", version: "1.0.0" },
    { capabilities: { tools: {} } },
)

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function json(data: unknown) {
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] }
}

function txt(msg: string) {
    return { content: [{ type: "text" as const, text: msg }] }
}

// ─────────────────────────────────────────────────────────────────────────────
// Tools
// ─────────────────────────────────────────────────────────────────────────────

// TODO: Register your tools here.
//
// server.registerTool(
//     "tool_name",
//     {
//         description: "What this tool does",
//         inputSchema: { /* zod schema or JSON schema */ },
//     },
//     async (input) => {
//         return txt("result")
//     },
// )

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport()
await server.connect(transport)
