/**
 * Stateful canvas tools: create, add, modify, remove, render, list, clear.
 *
 * All operations share a single CanvasManager instance. Errors are returned
 * as text content (not thrown) so the MCP client always gets a valid response.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { CanvasManager } from "../canvas.ts"
import { ShapeSchema } from "./schema.ts"

const canvasManager = new CanvasManager()

function json(data: unknown) {
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] }
}

function txt(msg: string) {
    return { content: [{ type: "text" as const, text: msg }] }
}

function err(message: string) {
    return { content: [{ type: "text" as const, text: message }], isError: true as const }
}

export function registerCanvasTools(server: McpServer): void {
    // ─────────────────────────────────────────────────────────────────────
    // create_canvas
    // ─────────────────────────────────────────────────────────────────────

    server.tool(
        "create_canvas",
        `Create a new named canvas for incremental diagram building.

Returns the canvas ID, which you'll pass to all other canvas tools. A canvas is a persistent workspace where you can add, modify, and remove shapes across multiple tool calls, then render the result at any time.`,
        {
            name: z.string().describe("Human-readable name for the canvas (e.g., 'architecture-diagram')"),
        },
        async ({ name }) => {
            try {
                const id = canvasManager.create(name)
                return json({ id })
            } catch (e) {
                return err(`Failed to create canvas: ${(e as Error).message}`)
            }
        },
    )

    // ─────────────────────────────────────────────────────────────────────
    // add_shape
    // ─────────────────────────────────────────────────────────────────────

    server.tool(
        "add_shape",
        `Add a shape to an existing canvas. Returns the shape's unique ID for later modification or removal.

Shape types: rectangle, text, line, group. See render_scene for full style reference.`,
        {
            canvas_id: z.string().describe("Canvas ID from create_canvas"),
            shape: ShapeSchema.describe("Shape object to add"),
        },
        async ({ canvas_id, shape }) => {
            try {
                const id = canvasManager.addShape(canvas_id, shape)
                return json({ id })
            } catch (e) {
                return err(`Failed to add shape: ${(e as Error).message}`)
            }
        },
    )

    // ─────────────────────────────────────────────────────────────────────
    // modify_shape
    // ─────────────────────────────────────────────────────────────────────

    server.tool(
        "modify_shape",
        `Modify properties of an existing shape on a canvas via shallow merge.

Only the fields you provide are updated; all others are preserved. For example, pass { "content": "new text" } to change just the text content of a text shape.`,
        {
            canvas_id: z.string().describe("Canvas ID"),
            shape_id: z.string().describe("Shape ID from add_shape"),
            updates: ShapeSchema.describe("Partial shape object with fields to update"),
        },
        async ({ canvas_id, shape_id, updates }) => {
            try {
                canvasManager.modifyShape(canvas_id, shape_id, updates)
                return txt("Shape updated successfully.")
            } catch (e) {
                return err(`Failed to modify shape: ${(e as Error).message}`)
            }
        },
    )

    // ─────────────────────────────────────────────────────────────────────
    // remove_shape
    // ─────────────────────────────────────────────────────────────────────

    server.tool(
        "remove_shape",
        "Remove a shape from a canvas by its ID.",
        {
            canvas_id: z.string().describe("Canvas ID"),
            shape_id: z.string().describe("Shape ID to remove"),
        },
        async ({ canvas_id, shape_id }) => {
            try {
                canvasManager.removeShape(canvas_id, shape_id)
                return txt("Shape removed successfully.")
            } catch (e) {
                return err(`Failed to remove shape: ${(e as Error).message}`)
            }
        },
    )

    // ─────────────────────────────────────────────────────────────────────
    // render_canvas
    // ─────────────────────────────────────────────────────────────────────

    server.tool(
        "render_canvas",
        `Render all shapes on a canvas to an ASCII/Unicode diagram string.

Call this at any point to see the current state of your canvas. Viewport auto-sizes to fit all shapes unless explicit width/height are provided.`,
        {
            canvas_id: z.string().describe("Canvas ID to render"),
            width: z.number().int().positive().optional().describe("Viewport width (auto-sized if omitted)"),
            height: z.number().int().positive().optional().describe("Viewport height (auto-sized if omitted)"),
        },
        async ({ canvas_id, width, height }) => {
            try {
                const result = canvasManager.render(canvas_id, { width, height })
                return txt(result)
            } catch (e) {
                return err(`Failed to render canvas: ${(e as Error).message}`)
            }
        },
    )

    // ─────────────────────────────────────────────────────────────────────
    // list_canvases
    // ─────────────────────────────────────────────────────────────────────

    server.tool(
        "list_canvases",
        "List all active canvases with their IDs, names, and shape counts.",
        {},
        async () => {
            try {
                const canvases = canvasManager.list()
                return json(canvases)
            } catch (e) {
                return err(`Failed to list canvases: ${(e as Error).message}`)
            }
        },
    )

    // ─────────────────────────────────────────────────────────────────────
    // clear_canvas
    // ─────────────────────────────────────────────────────────────────────

    server.tool(
        "clear_canvas",
        "Remove all shapes from a canvas. The canvas itself remains and can be reused.",
        {
            canvas_id: z.string().describe("Canvas ID to clear"),
        },
        async ({ canvas_id }) => {
            try {
                canvasManager.clear(canvas_id)
                return txt("Canvas cleared successfully.")
            } catch (e) {
                return err(`Failed to clear canvas: ${(e as Error).message}`)
            }
        },
    )
}
