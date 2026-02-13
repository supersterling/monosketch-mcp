import { describe, it, expect, beforeEach } from "bun:test"
import { CanvasManager } from "../src/canvas.ts"
import type { ShapeDescription } from "../src/renderer.ts"

describe("CanvasManager", () => {
    let manager: CanvasManager

    beforeEach(() => {
        manager = new CanvasManager()
    })

    it("creates a canvas and returns an ID", () => {
        const id = manager.create("my-diagram")
        expect(typeof id).toBe("string")
        expect(id.length).toBeGreaterThan(0)
    })

    it("adds shapes to a canvas", () => {
        const canvasId = manager.create("test")
        const shape: ShapeDescription = {
            type: "rectangle",
            x: 0,
            y: 0,
            width: 5,
            height: 3,
            border: { enabled: true },
        }
        const shapeId = manager.addShape(canvasId, shape)
        expect(typeof shapeId).toBe("string")
        expect(shapeId.length).toBeGreaterThan(0)

        // Shape count should reflect the addition
        const canvases = manager.list()
        const canvas = canvases.find(c => c.id === canvasId)
        expect(canvas).toBeDefined()
        expect(canvas!.shapeCount).toBe(1)
    })

    it("renders a canvas with shapes", () => {
        const canvasId = manager.create("render-test")
        manager.addShape(canvasId, {
            type: "rectangle",
            x: 0,
            y: 0,
            width: 5,
            height: 3,
            border: { enabled: true },
        })
        const result = manager.render(canvasId)
        // Should produce the same output as renderShapes with the same input
        expect(result).toContain("\u250C")  // top-left corner
        expect(result).toContain("\u2518")  // bottom-right corner
        expect(result.split("\n")).toHaveLength(3)
    })

    it("renders an empty canvas as empty string", () => {
        const canvasId = manager.create("empty")
        const result = manager.render(canvasId)
        expect(result).toBe("")
    })

    it("modifies shape properties", () => {
        const canvasId = manager.create("modify-test")
        const shapeId = manager.addShape(canvasId, {
            type: "text",
            x: 0,
            y: 0,
            content: "Hello",
            border: { enabled: false },
            horizontalAlign: "left",
            verticalAlign: "top",
        })

        // Render before modification
        const before = manager.render(canvasId)
        expect(before).toBe("Hello")

        // Modify the content
        manager.modifyShape(canvasId, shapeId, { content: "World" })

        // Render after modification
        const after = manager.render(canvasId)
        expect(after).toBe("World")
    })

    it("modifies shape properties via partial merge", () => {
        const canvasId = manager.create("partial-merge")
        const shapeId = manager.addShape(canvasId, {
            type: "rectangle",
            x: 0,
            y: 0,
            width: 5,
            height: 3,
            border: { enabled: true },
        })

        // Move the shape but keep everything else
        manager.modifyShape(canvasId, shapeId, { x: 10, y: 10 })

        // Verify the shape still renders (type/width/height preserved)
        const result = manager.render(canvasId)
        expect(result).toContain("\u250C")  // still has border corners
    })

    it("removes a shape", () => {
        const canvasId = manager.create("remove-test")
        const shapeId = manager.addShape(canvasId, {
            type: "rectangle",
            x: 0,
            y: 0,
            width: 3,
            height: 2,
            border: { enabled: true },
        })

        // Verify shape exists
        expect(manager.list().find(c => c.id === canvasId)!.shapeCount).toBe(1)

        // Remove it
        manager.removeShape(canvasId, shapeId)

        // Verify shape is gone
        expect(manager.list().find(c => c.id === canvasId)!.shapeCount).toBe(0)

        // Rendering should return empty
        expect(manager.render(canvasId)).toBe("")
    })

    it("lists active canvases with shape counts", () => {
        const id1 = manager.create("first")
        const id2 = manager.create("second")

        manager.addShape(id1, { type: "rectangle", x: 0, y: 0, width: 3, height: 2 })
        manager.addShape(id1, { type: "rectangle", x: 5, y: 0, width: 3, height: 2 })
        manager.addShape(id2, { type: "text", x: 0, y: 0, content: "hi" })

        const list = manager.list()
        expect(list).toHaveLength(2)

        const first = list.find(c => c.id === id1)!
        expect(first.name).toBe("first")
        expect(first.shapeCount).toBe(2)

        const second = list.find(c => c.id === id2)!
        expect(second.name).toBe("second")
        expect(second.shapeCount).toBe(1)
    })

    it("clears all shapes from a canvas", () => {
        const canvasId = manager.create("clear-test")
        manager.addShape(canvasId, { type: "rectangle", x: 0, y: 0, width: 3, height: 2 })
        manager.addShape(canvasId, { type: "rectangle", x: 5, y: 0, width: 3, height: 2 })

        expect(manager.list().find(c => c.id === canvasId)!.shapeCount).toBe(2)

        manager.clear(canvasId)

        expect(manager.list().find(c => c.id === canvasId)!.shapeCount).toBe(0)
        expect(manager.render(canvasId)).toBe("")
    })

    it("throws on unknown canvas ID", () => {
        expect(() => manager.addShape("nonexistent", { type: "rectangle" })).toThrow(
            /unknown canvas/i,
        )
        expect(() => manager.render("nonexistent")).toThrow(/unknown canvas/i)
        expect(() => manager.clear("nonexistent")).toThrow(/unknown canvas/i)
        expect(() => manager.removeShape("nonexistent", "any")).toThrow(/unknown canvas/i)
        expect(() => manager.modifyShape("nonexistent", "any", {})).toThrow(/unknown canvas/i)
    })

    it("throws on unknown shape ID", () => {
        const canvasId = manager.create("error-test")
        expect(() => manager.removeShape(canvasId, "nonexistent")).toThrow(/unknown shape/i)
        expect(() => manager.modifyShape(canvasId, "nonexistent", {})).toThrow(/unknown shape/i)
    })

    it("supports multiple canvases independently", () => {
        const id1 = manager.create("canvas-a")
        const id2 = manager.create("canvas-b")

        manager.addShape(id1, {
            type: "text",
            x: 0,
            y: 0,
            content: "AAA",
            border: { enabled: false },
            horizontalAlign: "left",
            verticalAlign: "top",
        })

        manager.addShape(id2, {
            type: "text",
            x: 0,
            y: 0,
            content: "BBB",
            border: { enabled: false },
            horizontalAlign: "left",
            verticalAlign: "top",
        })

        // Each canvas renders its own shapes
        expect(manager.render(id1)).toBe("AAA")
        expect(manager.render(id2)).toBe("BBB")

        // Clearing one does not affect the other
        manager.clear(id1)
        expect(manager.render(id1)).toBe("")
        expect(manager.render(id2)).toBe("BBB")
    })

    it("passes render options through to the renderer", () => {
        const canvasId = manager.create("options-test")
        manager.addShape(canvasId, {
            type: "rectangle",
            x: 0,
            y: 0,
            width: 3,
            height: 2,
            border: { enabled: true },
        })

        // With explicit viewport, trailing whitespace is trimmed but structure is same
        const result = manager.render(canvasId, { width: 10, height: 5 })
        // The rectangle still renders at top-left
        expect(result).toContain("\u250C")
    })

    it("returns unique IDs for canvases and shapes", () => {
        const canvasId1 = manager.create("a")
        const canvasId2 = manager.create("b")
        expect(canvasId1).not.toBe(canvasId2)

        const shapeId1 = manager.addShape(canvasId1, { type: "rectangle" })
        const shapeId2 = manager.addShape(canvasId1, { type: "rectangle" })
        expect(shapeId1).not.toBe(shapeId2)
    })
})
