/**
 * Shared zod schemas for MCP tool input validation.
 */

import { z } from "zod"

export const PointSchema = z.object({
    x: z.number().int(),
    y: z.number().int(),
})

export const BorderSchema = z.object({
    enabled: z.boolean(),
    style: z.string().optional().describe("Border style ID (S1=thin, S2=bold, S3=double, S4=rounded)"),
    corner: z.enum(["sharp", "rounded"]).optional(),
}).optional()

export const FillSchema = z.object({
    enabled: z.boolean(),
    style: z.string().optional().describe("Fill style ID (F1=space, F2=solid, F3=medium, F4=light, F5=diagonal)"),
}).optional()

export const StrokeSchema = z.object({
    enabled: z.boolean(),
    style: z.string().optional().describe("Stroke style ID"),
}).optional()

export const DashSchema = z.object({
    dash: z.number().int().positive(),
    gap: z.number().int().positive(),
    offset: z.number().int().optional(),
}).optional()

export const ShapeSchema: z.ZodType = z.object({
    type: z.enum(["rectangle", "text", "line", "group"]),
    x: z.number().int().optional(),
    y: z.number().int().optional(),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    content: z.string().optional().describe("Text content (for text shapes)"),
    horizontalAlign: z.enum(["left", "center", "right"]).optional(),
    verticalAlign: z.enum(["top", "middle", "bottom"]).optional(),
    points: z.array(PointSchema).optional().describe("Line waypoints as absolute coordinates"),
    startAnchor: z.string().optional().describe("Start anchor style (e.g., 'A1' for arrow, 'A220' for diamond, 'A3' for circle, or 'none')"),
    endAnchor: z.string().optional().describe("End anchor style"),
    border: BorderSchema,
    fill: FillSchema,
    stroke: StrokeSchema,
    dash: DashSchema,
    children: z.lazy(() => z.array(ShapeSchema)).optional().describe("Child shapes (for group type)"),
})
