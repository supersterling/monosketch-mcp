/**
 * CanvasManager: stateful session manager for incremental diagram building.
 *
 * Agents use this to create named canvases, add/modify/remove shapes across
 * multiple MCP tool calls, and render at any point. Thin wrapper around the
 * stateless `renderShapes()` pipeline.
 */

import { UUID } from "./engine/common/uuid.ts"
import { renderShapes, type ShapeDescription, type RenderOptions } from "./renderer.ts"

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

interface Canvas {
    id: string
    name: string
    shapes: Map<string, ShapeDescription>
}

// ---------------------------------------------------------------------------
// CanvasManager
// ---------------------------------------------------------------------------

export class CanvasManager {
    private canvases: Map<string, Canvas> = new Map()

    /**
     * Create a new named canvas, returning its unique ID.
     */
    create(name: string): string {
        const id = UUID.generate()
        this.canvases.set(id, { id, name, shapes: new Map() })
        return id
    }

    /**
     * Add a shape to a canvas, returning the shape's unique ID.
     */
    addShape(canvasId: string, shape: ShapeDescription): string {
        const canvas = this.requireCanvas(canvasId)
        const shapeId = UUID.generate()
        canvas.shapes.set(shapeId, { ...shape })
        return shapeId
    }

    /**
     * Update specific properties of an existing shape via shallow merge.
     */
    modifyShape(canvasId: string, shapeId: string, updates: Partial<ShapeDescription>): void {
        const canvas = this.requireCanvas(canvasId)
        const existing = canvas.shapes.get(shapeId)
        if (!existing) {
            throw new Error(`Unknown shape ID: ${shapeId}`)
        }
        canvas.shapes.set(shapeId, { ...existing, ...updates })
    }

    /**
     * Remove a shape from a canvas.
     */
    removeShape(canvasId: string, shapeId: string): void {
        const canvas = this.requireCanvas(canvasId)
        if (!canvas.shapes.has(shapeId)) {
            throw new Error(`Unknown shape ID: ${shapeId}`)
        }
        canvas.shapes.delete(shapeId)
    }

    /**
     * Render all shapes on a canvas to an ASCII string.
     * Delegates to the stateless `renderShapes()` pipeline.
     */
    render(canvasId: string, options?: RenderOptions): string {
        const canvas = this.requireCanvas(canvasId)
        const shapes = Array.from(canvas.shapes.values())
        return renderShapes(shapes, options)
    }

    /**
     * List all active canvases with their shape counts.
     */
    list(): Array<{ id: string; name: string; shapeCount: number }> {
        return Array.from(this.canvases.values()).map(canvas => ({
            id: canvas.id,
            name: canvas.name,
            shapeCount: canvas.shapes.size,
        }))
    }

    /**
     * Remove all shapes from a canvas (canvas itself remains).
     */
    clear(canvasId: string): void {
        const canvas = this.requireCanvas(canvasId)
        canvas.shapes.clear()
    }

    // -----------------------------------------------------------------------
    // Internal
    // -----------------------------------------------------------------------

    private requireCanvas(canvasId: string): Canvas {
        const canvas = this.canvases.get(canvasId)
        if (!canvas) {
            throw new Error(`Unknown canvas ID: ${canvasId}`)
        }
        return canvas
    }
}
