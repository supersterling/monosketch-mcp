/**
 * render_scene tool: stateless one-shot rendering of shape descriptions to ASCII.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { renderShapes } from "../renderer.ts"
import { ShapeSchema } from "./schema.ts"

export function registerSceneTools(server: McpServer): void {
    server.tool(
        "render_scene",
        `Render shapes to an ASCII/Unicode diagram string.

Takes an array of shape objects and composites them onto a text canvas. Returns the rendered diagram as plain text. Shapes are drawn in order (later shapes overlay earlier ones).

## Shape types

- **rectangle** - Box with optional border and fill. Set x, y, width, height.
- **text** - Text content inside an optional bordered box. Set x, y, width, height, content. Width/height auto-size to content if omitted.
- **line** - Polyline defined by waypoints. Set points array (absolute coordinates). At least 2 points required.
- **group** - Container that renders its children array. No visual output of its own.

## Border/stroke style IDs
- S1 = thin single line (default): \u2500 \u2502 \u250C \u2510 \u2514 \u2518
- S2 = bold: \u2501 \u2503 \u250F \u2513 \u2517 \u251B
- S3 = double: \u2550 \u2551 \u2554 \u2557 \u255A \u255D
- S4 = rounded (auto-selected when corner: "rounded"): \u2500 \u2502 \u256D \u256E \u2570 \u256F

## Fill style IDs (for rectangles)
- F1 = space (opaque blank)
- F2 = solid block \u2588
- F3 = medium shade \u2592
- F4 = light shade \u2591
- F5 = diagonal checker \u259A

## Anchor (arrow) style IDs (for line endpoints)
- A1 = filled arrows: \u25C0 \u25B6 \u25B2 \u25BC
- A12 = hollow arrows: \u25C1 \u25B7 \u25B3 \u25BD
- A2 = filled square \u25A0
- A21 = hollow square \u25A1
- A220 = filled diamond \u25C6
- A221 = hollow diamond \u25C7
- A3 = hollow circle \u25CB
- A5 = filled circle \u25CF
- "none" = no anchor

## Example

\`\`\`json
{
  "shapes": [
    { "type": "rectangle", "x": 0, "y": 0, "width": 12, "height": 3, "border": { "enabled": true } },
    { "type": "text", "x": 0, "y": 0, "width": 12, "height": 3, "content": "Hello", "border": { "enabled": true }, "horizontalAlign": "center", "verticalAlign": "middle" },
    { "type": "line", "points": [{"x": 6, "y": 3}, {"x": 6, "y": 6}], "stroke": { "enabled": true }, "endAnchor": "A1" }
  ]
}
\`\`\`

Viewport auto-sizes to fit all shapes. Use width/height to force a specific viewport size.`,
        {
            shapes: z.array(ShapeSchema).describe("Array of shape objects to render"),
            width: z.number().int().positive().optional().describe("Viewport width (auto-sized if omitted)"),
            height: z.number().int().positive().optional().describe("Viewport height (auto-sized if omitted)"),
        },
        async ({ shapes, width, height }) => {
            const result = renderShapes(shapes, { width, height })
            return { content: [{ type: "text", text: result }] }
        },
    )
}
