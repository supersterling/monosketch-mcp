/**
 * Renderer: converts ShapeDescription[] (JSON) into ASCII string output.
 *
 * This is the bridge between MCP tool input and the engine's rendering pipeline.
 */

import { RectangleBitmapFactory } from "./engine/bitmap/rectangle-bitmap-factory.ts"
import { TextBitmapFactory } from "./engine/bitmap/text-bitmap-factory.ts"
import { LineBitmapFactory } from "./engine/bitmap/line-bitmap-factory.ts"
import { MonoBitmap } from "./engine/bitmap/monobitmap.ts"
import { MonoBoard } from "./engine/board/board.ts"
import { HighlightType } from "./engine/board/pixel.ts"
import { Point } from "./engine/geo/point.ts"
import { Rect } from "./engine/geo/rect.ts"
import { Size } from "./engine/geo/size.ts"
import { RectangleExtra, TextExtra, LineExtra } from "./engine/style/shape-extra.ts"
import { ShapeExtraManager } from "./engine/style/extra-manager.ts"
import {
    StraightStrokeDashPattern,
    RectangleBorderCornerPattern,
    TextAlign,
    TextHorizontalAlign,
    TextVerticalAlign,
} from "./engine/style/style.ts"

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface ShapeDescription {
    type: "rectangle" | "text" | "line" | "group"

    // Position (rectangle, text, group)
    x?: number
    y?: number
    width?: number
    height?: number

    // Text-specific
    content?: string
    horizontalAlign?: "left" | "center" | "right"
    verticalAlign?: "top" | "middle" | "bottom"

    // Line-specific
    points?: Array<{ x: number; y: number }>
    startAnchor?: string   // anchor style ID or "none"
    endAnchor?: string     // anchor style ID or "none"

    // Common style
    border?: { enabled: boolean; style?: string; corner?: "sharp" | "rounded" }
    fill?: { enabled: boolean; style?: string }
    stroke?: { enabled: boolean; style?: string }
    dash?: { dash: number; gap: number; offset?: number }

    // Group
    children?: ShapeDescription[]
}

export interface RenderOptions {
    width?: number    // viewport width (auto-sized if omitted)
    height?: number   // viewport height (auto-sized if omitted)
}

// ---------------------------------------------------------------------------
// Internal types for the rendering pipeline
// ---------------------------------------------------------------------------

interface RenderedBitmap {
    position: Point
    bitmap: MonoBitmap.Bitmap
}

// ---------------------------------------------------------------------------
// Main render function
// ---------------------------------------------------------------------------

export function renderShapes(
    shapes: ShapeDescription[],
    options: RenderOptions = {},
): string {
    // 1. Convert all descriptions into positioned bitmaps
    const renderedBitmaps = shapes.flatMap(shape => shapeToRenderedBitmaps(shape))

    if (renderedBitmaps.length === 0) {
        return ""
    }

    // 2. Calculate viewport bounds
    const viewportRect = computeViewport(renderedBitmaps, options)

    // 3. Composite onto MonoBoard
    const board = new MonoBoard()
    board.clearAndSetWindow(viewportRect)

    for (const rb of renderedBitmaps) {
        board.fillBitmap(rb.position, rb.bitmap, HighlightType.NO)
    }

    // 4. Read board as string
    return boardToString(board, viewportRect)
}

// ---------------------------------------------------------------------------
// Shape → RenderedBitmap converters
// ---------------------------------------------------------------------------

function shapeToRenderedBitmaps(shape: ShapeDescription): RenderedBitmap[] {
    switch (shape.type) {
        case "rectangle":
            return rectangleToRendered(shape)
        case "text":
            return textToRendered(shape)
        case "line":
            return lineToRendered(shape)
        case "group":
            return groupToRendered(shape)
    }
}

function rectangleToRendered(shape: ShapeDescription): RenderedBitmap[] {
    const x = shape.x ?? 0
    const y = shape.y ?? 0
    const w = shape.width ?? 1
    const h = shape.height ?? 1

    const extra = buildRectangleExtra(shape)
    const size = Size.of(w, h)
    const bitmap = RectangleBitmapFactory.toBitmap(size, extra)

    return [{ position: new Point(x, y), bitmap }]
}

function textToRendered(shape: ShapeDescription): RenderedBitmap[] {
    const x = shape.x ?? 0
    const y = shape.y ?? 0
    const content = shape.content ?? ""
    const lines = content.split("\n")

    // If width/height not specified, auto-size to content
    const maxLineWidth = Math.max(1, ...lines.map(l => l.length))
    const hasBorder = shape.border?.enabled ?? false
    const borderPadding = hasBorder ? 2 : 0
    const w = shape.width ?? (maxLineWidth + borderPadding)
    const h = shape.height ?? (lines.length + borderPadding)

    const extra = buildTextExtra(shape)
    const size = Size.of(w, h)
    const bitmap = TextBitmapFactory.toBitmap(size, lines, extra, false)

    return [{ position: new Point(x, y), bitmap }]
}

function lineToRendered(shape: ShapeDescription): RenderedBitmap[] {
    const points = shape.points
    if (!points || points.length < 2) {
        return []
    }

    // Convert to engine Points (absolute coordinates)
    const absolutePoints = points.map(p => new Point(p.x, p.y))

    // Calculate bounding box
    const minX = Math.min(...absolutePoints.map(p => p.left))
    const minY = Math.min(...absolutePoints.map(p => p.top))

    // LineBitmapFactory expects absolute joint points (BitmapBuilderDecoration handles offset)
    const extra = buildLineExtra(shape)
    const bitmap = LineBitmapFactory.toBitmap(absolutePoints, extra)

    return [{ position: new Point(minX, minY), bitmap }]
}

function groupToRendered(shape: ShapeDescription): RenderedBitmap[] {
    const children = shape.children ?? []
    return children.flatMap(child => shapeToRenderedBitmaps(child))
}

// ---------------------------------------------------------------------------
// Style builders
// ---------------------------------------------------------------------------

function buildRectangleExtra(shape: ShapeDescription): RectangleExtra {
    const borderEnabled = shape.border?.enabled ?? true
    const fillEnabled = shape.fill?.enabled ?? false

    const borderStyleId = resolveBorderStyleId(shape)
    const fillStyleId = shape.fill?.style

    const corner = shape.border?.corner === "rounded"
        ? RectangleBorderCornerPattern.ENABLED
        : RectangleBorderCornerPattern.DISABLED

    const dashPattern = shape.dash
        ? new StraightStrokeDashPattern(shape.dash.dash, shape.dash.gap, shape.dash.offset ?? 0)
        : StraightStrokeDashPattern.SOLID

    return new RectangleExtra(
        fillEnabled,
        ShapeExtraManager.getRectangleFillStyle(fillStyleId),
        borderEnabled,
        ShapeExtraManager.getRectangleBorderStyle(borderStyleId),
        dashPattern,
        corner,
    )
}

function buildTextExtra(shape: ShapeDescription): TextExtra {
    const boundExtra = buildRectangleExtra(shape)

    const hAlign = resolveHorizontalAlign(shape.horizontalAlign)
    const vAlign = resolveVerticalAlign(shape.verticalAlign)
    const textAlign = new TextAlign(hAlign, vAlign)

    return new TextExtra(boundExtra, textAlign)
}

function buildLineExtra(shape: ShapeDescription): LineExtra {
    const strokeEnabled = shape.stroke?.enabled ?? true
    const strokeStyleId = shape.stroke?.style

    const dashPattern = shape.dash
        ? new StraightStrokeDashPattern(shape.dash.dash, shape.dash.gap, shape.dash.offset ?? 0)
        : StraightStrokeDashPattern.SOLID

    const startAnchorId = shape.startAnchor && shape.startAnchor !== "none"
        ? shape.startAnchor
        : undefined
    const endAnchorId = shape.endAnchor && shape.endAnchor !== "none"
        ? shape.endAnchor
        : undefined

    return new LineExtra(
        strokeEnabled,
        ShapeExtraManager.getLineStrokeStyle(strokeStyleId),
        startAnchorId !== undefined,
        ShapeExtraManager.getStartHeadAnchorChar(startAnchorId),
        endAnchorId !== undefined,
        ShapeExtraManager.getEndHeadAnchorChar(endAnchorId),
        dashPattern,
        false,
    )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveBorderStyleId(shape: ShapeDescription): string | undefined {
    if (!shape.border) return undefined
    if (shape.border.style) return shape.border.style
    if (shape.border.corner === "rounded") return "S1" // S1 + rounded → S4 via corner pattern
    if (shape.border.enabled) return "S1"
    return undefined
}

function resolveHorizontalAlign(align?: "left" | "center" | "right"): TextHorizontalAlign {
    switch (align) {
        case "left": return TextHorizontalAlign.LEFT
        case "right": return TextHorizontalAlign.RIGHT
        case "center": return TextHorizontalAlign.MIDDLE
        default: return TextHorizontalAlign.MIDDLE
    }
}

function resolveVerticalAlign(align?: "top" | "middle" | "bottom"): TextVerticalAlign {
    switch (align) {
        case "top": return TextVerticalAlign.TOP
        case "bottom": return TextVerticalAlign.BOTTOM
        case "middle": return TextVerticalAlign.MIDDLE
        default: return TextVerticalAlign.MIDDLE
    }
}

function computeViewport(bitmaps: RenderedBitmap[], options: RenderOptions): Rect {
    if (options.width !== undefined && options.height !== undefined) {
        return Rect.byLTWH(0, 0, options.width, options.height)
    }

    // Auto-size: union of all bitmaps
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    for (const rb of bitmaps) {
        const x = rb.position.left
        const y = rb.position.top
        const w = rb.bitmap.size.width
        const h = rb.bitmap.size.height

        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x + w - 1)
        maxY = Math.max(maxY, y + h - 1)
    }

    const width = options.width ?? (maxX - minX + 1)
    const height = options.height ?? (maxY - minY + 1)

    return Rect.byLTWH(minX, minY, width, height)
}

function boardToString(board: MonoBoard, viewport: Rect): string {
    const lines: string[] = []

    for (let row = viewport.top; row <= viewport.bottom; row++) {
        let line = ""
        for (let col = viewport.left; col <= viewport.right; col++) {
            const pixel = board.get(col, row)
            if (pixel.isTransparent) {
                line += " "
            } else {
                line += pixel.visualChar
            }
        }
        lines.push(line.trimEnd())
    }

    // Remove trailing empty lines
    while (lines.length > 0 && lines[lines.length - 1] === "") {
        lines.pop()
    }

    return lines.join("\n")
}
