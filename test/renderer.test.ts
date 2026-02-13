import { describe, it, expect } from "bun:test"
import { renderShapes, type ShapeDescription, type RenderOptions } from "../src/renderer.ts"

// Unicode box-drawing characters used by S1 (thin single line) stroke style
const TL = "\u250C"  // ┌
const TR = "\u2510"  // ┐
const BL = "\u2514"  // └
const BR = "\u2518"  // ┘
const H  = "\u2500"  // ─
const V  = "\u2502"  // │

// S4 (rounded) corners
const RTL = "\u256D"  // ╭
const RTR = "\u256E"  // ╮
const RBL = "\u2570"  // ╰
const RBR = "\u256F"  // ╯

// S2 (bold) stroke style
const BH = "\u2501"  // ━
const BV = "\u2503"  // ┃
const BTL = "\u250F" // ┏
const BTR = "\u2513" // ┓
const BBL = "\u2517" // ┗
const BBR = "\u251B" // ┛

// S3 (double) stroke style
const DH = "\u2550"  // ═
const DV = "\u2551"  // ║
const DTL = "\u2554" // ╔
const DTR = "\u2557" // ╗
const DBL = "\u255A" // ╚
const DBR = "\u255D" // ╝

// Fill characters
const FILL_BLOCK = "\u2588" // █
const FILL_MED   = "\u2592" // ▒
const FILL_LIGHT = "\u2591" // ░

// Arrow anchors (A1)
const ARROW_LEFT  = "\u25C0" // ◀
const ARROW_RIGHT = "\u25B6" // ▶
const ARROW_UP    = "\u25B2" // ▲
const ARROW_DOWN  = "\u25BC" // ▼

// Crossing / junction characters for single thin lines
const CROSS = "\u253C" // ┼
const T_DOWN = "\u252C" // ┬
const T_UP   = "\u2534" // ┴
const T_RIGHT = "\u251C" // ├
const T_LEFT  = "\u2524" // ┤

describe("renderShapes", () => {
    // -----------------------------------------------------------------------
    // Basic shapes
    // -----------------------------------------------------------------------

    describe("rectangles", () => {
        it("renders a simple rectangle with border", () => {
            const shapes: ShapeDescription[] = [{
                type: "rectangle",
                x: 0,
                y: 0,
                width: 5,
                height: 3,
                border: { enabled: true },
            }]
            const result = renderShapes(shapes)
            expect(result).toBe(
                `${TL}${H}${H}${H}${TR}\n` +
                `${V}   ${V}\n` +
                `${BL}${H}${H}${H}${BR}`
            )
        })

        it("renders a rectangle with rounded corners", () => {
            const shapes: ShapeDescription[] = [{
                type: "rectangle",
                x: 0,
                y: 0,
                width: 5,
                height: 3,
                border: { enabled: true, corner: "rounded" },
            }]
            const result = renderShapes(shapes)
            expect(result).toBe(
                `${RTL}${H}${H}${H}${RTR}\n` +
                `${V}   ${V}\n` +
                `${RBL}${H}${H}${H}${RBR}`
            )
        })

        it("renders a rectangle with fill", () => {
            const shapes: ShapeDescription[] = [{
                type: "rectangle",
                x: 0,
                y: 0,
                width: 3,
                height: 3,
                border: { enabled: true },
                fill: { enabled: true, style: "F2" },
            }]
            const result = renderShapes(shapes)
            // Fill + border: border on edges, fill inside
            expect(result).toBe(
                `${TL}${H}${TR}\n` +
                `${V}${FILL_BLOCK}${V}\n` +
                `${BL}${H}${BR}`
            )
        })

        it("renders a rectangle with no border but fill", () => {
            const shapes: ShapeDescription[] = [{
                type: "rectangle",
                x: 0,
                y: 0,
                width: 3,
                height: 2,
                border: { enabled: false },
                fill: { enabled: true, style: "F2" },
            }]
            const result = renderShapes(shapes)
            expect(result).toBe(
                `${FILL_BLOCK}${FILL_BLOCK}${FILL_BLOCK}\n` +
                `${FILL_BLOCK}${FILL_BLOCK}${FILL_BLOCK}`
            )
        })

        it("renders a rectangle with bold border style", () => {
            const shapes: ShapeDescription[] = [{
                type: "rectangle",
                x: 0,
                y: 0,
                width: 4,
                height: 3,
                border: { enabled: true, style: "S2" },
            }]
            const result = renderShapes(shapes)
            expect(result).toBe(
                `${BTL}${BH}${BH}${BTR}\n` +
                `${BV}  ${BV}\n` +
                `${BBL}${BH}${BH}${BBR}`
            )
        })

        it("renders a rectangle with double border style", () => {
            const shapes: ShapeDescription[] = [{
                type: "rectangle",
                x: 0,
                y: 0,
                width: 4,
                height: 3,
                border: { enabled: true, style: "S3" },
            }]
            const result = renderShapes(shapes)
            expect(result).toBe(
                `${DTL}${DH}${DH}${DTR}\n` +
                `${DV}  ${DV}\n` +
                `${DBL}${DH}${DH}${DBR}`
            )
        })

        it("renders a 1x1 rectangle", () => {
            const shapes: ShapeDescription[] = [{
                type: "rectangle",
                x: 0,
                y: 0,
                width: 1,
                height: 1,
                border: { enabled: true },
            }]
            const result = renderShapes(shapes)
            // 1x1 rectangle renders as a small square
            expect(result).toBe("\u25A1")
        })
    })

    describe("text", () => {
        it("renders text centered in a box", () => {
            const shapes: ShapeDescription[] = [{
                type: "text",
                x: 0,
                y: 0,
                width: 7,
                height: 3,
                content: "Hi",
                border: { enabled: true },
                horizontalAlign: "center",
                verticalAlign: "middle",
            }]
            const result = renderShapes(shapes)
            // 7 wide, 3 tall box with "Hi" centered
            // inner area is 5 wide, 1 tall
            // "Hi" is 2 chars, centered in 5 => offset 1 from left inner edge
            expect(result).toBe(
                `${TL}${H}${H}${H}${H}${H}${TR}\n` +
                `${V} Hi  ${V}\n` +
                `${BL}${H}${H}${H}${H}${H}${BR}`
            )
        })

        it("renders text left-aligned in a box", () => {
            const shapes: ShapeDescription[] = [{
                type: "text",
                x: 0,
                y: 0,
                width: 7,
                height: 3,
                content: "Hi",
                border: { enabled: true },
                horizontalAlign: "left",
                verticalAlign: "middle",
            }]
            const result = renderShapes(shapes)
            expect(result).toBe(
                `${TL}${H}${H}${H}${H}${H}${TR}\n` +
                `${V}Hi   ${V}\n` +
                `${BL}${H}${H}${H}${H}${H}${BR}`
            )
        })

        it("renders text right-aligned in a box", () => {
            const shapes: ShapeDescription[] = [{
                type: "text",
                x: 0,
                y: 0,
                width: 7,
                height: 3,
                content: "Hi",
                border: { enabled: true },
                horizontalAlign: "right",
                verticalAlign: "middle",
            }]
            const result = renderShapes(shapes)
            expect(result).toBe(
                `${TL}${H}${H}${H}${H}${H}${TR}\n` +
                `${V}   Hi${V}\n` +
                `${BL}${H}${H}${H}${H}${H}${BR}`
            )
        })

        it("renders multi-line text", () => {
            const shapes: ShapeDescription[] = [{
                type: "text",
                x: 0,
                y: 0,
                width: 7,
                height: 5,
                content: "AB\nCD",
                border: { enabled: true },
                horizontalAlign: "center",
                verticalAlign: "middle",
            }]
            const result = renderShapes(shapes)
            // inner: 5 wide, 3 tall, 2 lines centered vertically (top offset = floor((3-2)/2)+1 = 1)
            expect(result).toBe(
                `${TL}${H}${H}${H}${H}${H}${TR}\n` +
                `${V} AB  ${V}\n` +
                `${V} CD  ${V}\n` +
                `${V}     ${V}\n` +
                `${BL}${H}${H}${H}${H}${H}${BR}`
            )
        })

        it("renders text without border", () => {
            const shapes: ShapeDescription[] = [{
                type: "text",
                x: 0,
                y: 0,
                width: 4,
                height: 2,
                content: "AB\nCD",
                border: { enabled: false },
                horizontalAlign: "left",
                verticalAlign: "top",
            }]
            const result = renderShapes(shapes)
            expect(result).toBe("AB\nCD")
        })
    })

    describe("lines", () => {
        it("renders a horizontal line", () => {
            const shapes: ShapeDescription[] = [{
                type: "line",
                points: [{ x: 0, y: 0 }, { x: 5, y: 0 }],
                stroke: { enabled: true },
            }]
            const result = renderShapes(shapes)
            expect(result).toBe(`${H}${H}${H}${H}${H}${H}`)
        })

        it("renders a vertical line", () => {
            const shapes: ShapeDescription[] = [{
                type: "line",
                points: [{ x: 0, y: 0 }, { x: 0, y: 3 }],
                stroke: { enabled: true },
            }]
            const result = renderShapes(shapes)
            expect(result).toBe(`${V}\n${V}\n${V}\n${V}`)
        })

        it("renders a line with arrow endpoint", () => {
            const shapes: ShapeDescription[] = [{
                type: "line",
                points: [{ x: 0, y: 0 }, { x: 5, y: 0 }],
                stroke: { enabled: true },
                endAnchor: "A1",
            }]
            const result = renderShapes(shapes)
            expect(result).toBe(`${H}${H}${H}${H}${H}${ARROW_RIGHT}`)
        })

        it("renders a line with arrow at start", () => {
            const shapes: ShapeDescription[] = [{
                type: "line",
                points: [{ x: 0, y: 0 }, { x: 5, y: 0 }],
                stroke: { enabled: true },
                startAnchor: "A1",
            }]
            const result = renderShapes(shapes)
            expect(result).toBe(`${ARROW_LEFT}${H}${H}${H}${H}${H}`)
        })

        it("renders an L-shaped line (2 segments)", () => {
            const shapes: ShapeDescription[] = [{
                type: "line",
                points: [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 3 }],
                stroke: { enabled: true },
            }]
            const result = renderShapes(shapes)
            // Horizontal from (0,0) to (4,0), then vertical from (4,0) to (4,3)
            // Corner at (4,0) should be a downLeft corner character ┐
            const expected =
                `${H}${H}${H}${H}${TR}\n` +
                `    ${V}\n` +
                `    ${V}\n` +
                `    ${V}`
            expect(result).toBe(expected)
        })

        it("renders a line with no points as empty", () => {
            const shapes: ShapeDescription[] = [{
                type: "line",
                points: [],
                stroke: { enabled: true },
            }]
            const result = renderShapes(shapes)
            expect(result).toBe("")
        })
    })

    // -----------------------------------------------------------------------
    // Composition
    // -----------------------------------------------------------------------

    describe("composition", () => {
        it("renders multiple non-overlapping rectangles", () => {
            const shapes: ShapeDescription[] = [
                {
                    type: "rectangle",
                    x: 0,
                    y: 0,
                    width: 3,
                    height: 3,
                    border: { enabled: true },
                },
                {
                    type: "rectangle",
                    x: 5,
                    y: 0,
                    width: 3,
                    height: 3,
                    border: { enabled: true },
                },
            ]
            const result = renderShapes(shapes)
            const expected =
                `${TL}${H}${TR}  ${TL}${H}${TR}\n` +
                `${V} ${V}  ${V} ${V}\n` +
                `${BL}${H}${BR}  ${BL}${H}${BR}`
            expect(result).toBe(expected)
        })

        it("renders overlapping shapes (later shapes on top)", () => {
            // Two 3x3 rectangles, second overlaps first by 1 column
            const shapes: ShapeDescription[] = [
                {
                    type: "rectangle",
                    x: 0,
                    y: 0,
                    width: 3,
                    height: 3,
                    border: { enabled: true },
                },
                {
                    type: "rectangle",
                    x: 2,
                    y: 0,
                    width: 3,
                    height: 3,
                    border: { enabled: true },
                },
            ]
            const result = renderShapes(shapes)
            // The overlap column (x=2) produces junction characters via crossing resolution
            const expected =
                `${TL}${H}${T_DOWN}${H}${TR}\n` +
                `${V} ${V} ${V}\n` +
                `${BL}${H}${T_UP}${H}${BR}`
            expect(result).toBe(expected)
        })

        it("renders a text box (rectangle + text at same position)", () => {
            // A common pattern: rectangle border with text inside
            const shapes: ShapeDescription[] = [{
                type: "text",
                x: 0,
                y: 0,
                width: 9,
                height: 3,
                content: "Hello",
                border: { enabled: true },
                horizontalAlign: "center",
                verticalAlign: "middle",
            }]
            const result = renderShapes(shapes)
            expect(result).toBe(
                `${TL}${H}${H}${H}${H}${H}${H}${H}${TR}\n` +
                `${V} Hello ${V}\n` +
                `${BL}${H}${H}${H}${H}${H}${H}${H}${BR}`
            )
        })
    })

    // -----------------------------------------------------------------------
    // Viewport
    // -----------------------------------------------------------------------

    describe("viewport", () => {
        it("auto-sizes viewport to shape bounding box", () => {
            const shapes: ShapeDescription[] = [{
                type: "rectangle",
                x: 2,
                y: 1,
                width: 3,
                height: 2,
                border: { enabled: true },
            }]
            const result = renderShapes(shapes)
            // The viewport should start at (2,1) and end at (4,2)
            // No leading spaces since viewport origin matches shape origin
            expect(result).toBe(
                `${TL}${H}${TR}\n` +
                `${BL}${H}${BR}`
            )
        })

        it("respects explicit viewport width/height", () => {
            const shapes: ShapeDescription[] = [{
                type: "rectangle",
                x: 0,
                y: 0,
                width: 3,
                height: 2,
                border: { enabled: true },
            }]
            const result = renderShapes(shapes, { width: 6, height: 4 })
            // Extra space on right and below
            expect(result).toBe(
                `${TL}${H}${TR}\n` +
                `${BL}${H}${BR}`
            )
            // Despite viewport being larger, trailing spaces are trimmed
        })

        it("trims trailing whitespace per line", () => {
            const shapes: ShapeDescription[] = [{
                type: "rectangle",
                x: 0,
                y: 0,
                width: 3,
                height: 2,
                border: { enabled: true },
            }]
            const result = renderShapes(shapes, { width: 10, height: 2 })
            // Each line should not have trailing spaces
            const lines = result.split("\n")
            for (const line of lines) {
                expect(line).toBe(line.trimEnd())
            }
        })
    })

    // -----------------------------------------------------------------------
    // Lines - advanced
    // -----------------------------------------------------------------------

    describe("line crossings", () => {
        it("renders crossing lines with junction character", () => {
            // Horizontal line at y=2 from x=0 to x=6
            // Vertical line at x=3 from y=0 to y=4
            const shapes: ShapeDescription[] = [
                {
                    type: "line",
                    points: [{ x: 0, y: 2 }, { x: 6, y: 2 }],
                    stroke: { enabled: true },
                },
                {
                    type: "line",
                    points: [{ x: 3, y: 0 }, { x: 3, y: 4 }],
                    stroke: { enabled: true },
                },
            ]
            const result = renderShapes(shapes)
            const lines = result.split("\n")
            // At (3,2) there should be a crossing character ┼
            expect(lines[2]![3]).toBe(CROSS)
        })
    })

    // -----------------------------------------------------------------------
    // Groups
    // -----------------------------------------------------------------------

    describe("groups", () => {
        it("renders group children at their positions", () => {
            const shapes: ShapeDescription[] = [{
                type: "group",
                children: [
                    {
                        type: "rectangle",
                        x: 0,
                        y: 0,
                        width: 3,
                        height: 3,
                        border: { enabled: true },
                    },
                    {
                        type: "rectangle",
                        x: 4,
                        y: 0,
                        width: 3,
                        height: 3,
                        border: { enabled: true },
                    },
                ],
            }]
            const result = renderShapes(shapes)
            const expected =
                `${TL}${H}${TR} ${TL}${H}${TR}\n` +
                `${V} ${V} ${V} ${V}\n` +
                `${BL}${H}${BR} ${BL}${H}${BR}`
            expect(result).toBe(expected)
        })

        it("renders nested groups", () => {
            const shapes: ShapeDescription[] = [{
                type: "group",
                children: [{
                    type: "group",
                    children: [{
                        type: "rectangle",
                        x: 0,
                        y: 0,
                        width: 3,
                        height: 2,
                        border: { enabled: true },
                    }],
                }],
            }]
            const result = renderShapes(shapes)
            expect(result).toBe(
                `${TL}${H}${TR}\n` +
                `${BL}${H}${BR}`
            )
        })
    })

    // -----------------------------------------------------------------------
    // Edge cases
    // -----------------------------------------------------------------------

    describe("edge cases", () => {
        it("returns empty string for no shapes", () => {
            const result = renderShapes([])
            expect(result).toBe("")
        })

        it("handles shape at non-zero origin", () => {
            const shapes: ShapeDescription[] = [{
                type: "rectangle",
                x: 10,
                y: 5,
                width: 3,
                height: 2,
                border: { enabled: true },
            }]
            const result = renderShapes(shapes)
            // Auto-viewport should anchor to shape origin
            expect(result).toBe(
                `${TL}${H}${TR}\n` +
                `${BL}${H}${BR}`
            )
        })

        it("renders a rectangle with dash pattern", () => {
            const shapes: ShapeDescription[] = [{
                type: "rectangle",
                x: 0,
                y: 0,
                width: 7,
                height: 1,
                border: { enabled: true },
                dash: { dash: 2, gap: 1 },
            }]
            const result = renderShapes(shapes)
            // 1-height rect generates 6 border chars (horizontalLine exclusive ends).
            // dash=2, gap=1 pattern over 6 chars: visible,visible,gap,visible,visible,gap
            // Trailing gap is trimmed.
            expect(result).toBe(`${H}${H} ${H}${H}`)
        })

        it("renders a line with bold stroke", () => {
            const shapes: ShapeDescription[] = [{
                type: "line",
                points: [{ x: 0, y: 0 }, { x: 3, y: 0 }],
                stroke: { enabled: true, style: "S2" },
            }]
            const result = renderShapes(shapes)
            expect(result).toBe(`${BH}${BH}${BH}${BH}`)
        })

        it("renders text auto-sizing when no width/height given", () => {
            const shapes: ShapeDescription[] = [{
                type: "text",
                x: 0,
                y: 0,
                content: "Hello",
                border: { enabled: false },
                horizontalAlign: "left",
                verticalAlign: "top",
            }]
            const result = renderShapes(shapes)
            expect(result).toBe("Hello")
        })
    })
})
