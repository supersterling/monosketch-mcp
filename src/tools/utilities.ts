/**
 * Utility tools: list_styles, measure_text.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import {
    PredefinedStraightStrokeStyle,
    PredefinedRectangleFillStyle,
    PredefinedAnchorChar,
} from "../engine/style/predefined-styles.ts"

function json(data: unknown) {
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] }
}

export function registerUtilityTools(server: McpServer): void {
    // ─────────────────────────────────────────────────────────────────────
    // list_styles
    // ─────────────────────────────────────────────────────────────────────

    server.tool(
        "list_styles",
        `List all available style IDs for borders, fills, strokes, and anchors.

Returns structured JSON with every predefined style and its sample characters. Useful for discovering what styles are available before building a diagram. In most cases you can skip this call -- the render_scene description includes the common style IDs inline.`,
        {},
        async () => {
            const strokeStyles = PredefinedStraightStrokeStyle.PREDEFINED_STYLES.map(s => ({
                id: s.id,
                name: s.displayName,
                horizontal: s.horizontal,
                vertical: s.vertical,
                corners: {
                    topLeft: s.upRight,
                    topRight: s.downLeft,
                    bottomLeft: s.downRight,
                    bottomRight: s.upLeft,
                },
            }))

            const fillStyles = PredefinedRectangleFillStyle.PREDEFINED_STYLES.map(s => ({
                id: s.id,
                name: s.displayName,
            }))

            const anchorChars = PredefinedAnchorChar.PREDEFINED_ANCHOR_CHARS.map(a => ({
                id: a.id,
                name: a.displayName,
                left: a.left,
                right: a.right,
                top: a.top,
                bottom: a.bottom,
            }))

            return json({ strokeStyles, fillStyles, anchorChars })
        },
    )

    // ─────────────────────────────────────────────────────────────────────
    // measure_text
    // ─────────────────────────────────────────────────────────────────────

    server.tool(
        "measure_text",
        `Measure the dimensions of text when word-wrapped to a maximum width.

Returns { width, height } in character cells. Useful for pre-calculating text shape dimensions before rendering.`,
        {
            text: z.string().describe("The text to measure"),
            max_width: z.number().int().positive().describe("Maximum line width in characters for word wrapping"),
        },
        async ({ text, max_width }) => {
            const wrapped = wordWrap(text, max_width)
            const width = Math.max(1, ...wrapped.map(line => line.length))
            const height = Math.max(1, wrapped.length)
            return json({ width, height })
        },
    )
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Simple word-wrap: breaks text into lines no wider than `maxWidth`.
 * Respects existing newlines. Breaks long words at the boundary.
 */
function wordWrap(text: string, maxWidth: number): string[] {
    const result: string[] = []

    for (const paragraph of text.split("\n")) {
        if (paragraph.length === 0) {
            result.push("")
            continue
        }

        const words = paragraph.split(/\s+/)
        let currentLine = ""

        for (const word of words) {
            if (word.length === 0) continue

            // Word itself exceeds max width -- force-break it
            if (word.length > maxWidth) {
                if (currentLine.length > 0) {
                    result.push(currentLine)
                    currentLine = ""
                }
                for (let i = 0; i < word.length; i += maxWidth) {
                    result.push(word.slice(i, i + maxWidth))
                }
                continue
            }

            if (currentLine.length === 0) {
                currentLine = word
            } else if (currentLine.length + 1 + word.length <= maxWidth) {
                currentLine += " " + word
            } else {
                result.push(currentLine)
                currentLine = word
            }
        }

        if (currentLine.length > 0) {
            result.push(currentLine)
        }
    }

    return result.length > 0 ? result : [""]
}
