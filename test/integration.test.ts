import { describe, it, expect, beforeEach } from "bun:test"
import { renderShapes, type ShapeDescription } from "../src/renderer.ts"
import { CanvasManager } from "../src/canvas.ts"

// ---------------------------------------------------------------------------
// Unicode box-drawing constants (same as renderer.test.ts for consistency)
// ---------------------------------------------------------------------------

// S1 (thin single line)
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

// Arrow anchors (A1)
const ARROW_DOWN  = "\u25BC" // ▼
const ARROW_RIGHT = "\u25B6" // ▶

// Crossing / junction characters for single thin lines
const CROSS = "\u253C"   // ┼
const T_DOWN = "\u252C"  // ┬
const T_UP   = "\u2534"  // ┴
const T_RIGHT = "\u251C" // ├
const T_LEFT  = "\u2524" // ┤

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Split output into lines for structural assertions. */
function lines(output: string): string[] {
    return output.split("\n")
}

/** Max line width in the rendered output. */
function maxWidth(output: string): number {
    return Math.max(0, ...lines(output).map(l => l.length))
}

/** Count occurrences of a substring in the output. */
function count(output: string, sub: string): number {
    let n = 0
    let idx = 0
    while ((idx = output.indexOf(sub, idx)) !== -1) {
        n++
        idx += sub.length
    }
    return n
}

// ===========================================================================
// 1. Architecture diagram
// ===========================================================================

describe("Integration: Architecture diagram", () => {
    // Three boxes stacked vertically, connected by vertical lines with arrows:
    //
    //   ┌──────────┐
    //   │ Frontend │
    //   └──────────┘
    //        │
    //        ▼
    //   ┌──────────┐
    //   │   API    │
    //   └──────────┘
    //        │
    //        ▼
    //   ┌──────────┐
    //   │ Database │
    //   └──────────┘

    const boxW = 12
    const boxH = 3
    const gap = 3   // rows between boxes (line + arrow)

    const shapes: ShapeDescription[] = [
        // Frontend box
        {
            type: "text",
            x: 0, y: 0,
            width: boxW, height: boxH,
            content: "Frontend",
            border: { enabled: true },
            horizontalAlign: "center",
            verticalAlign: "middle",
        },
        // Connector: Frontend -> API
        {
            type: "line",
            points: [
                { x: 5, y: boxH },
                { x: 5, y: boxH + gap - 1 },
            ],
            stroke: { enabled: true },
            endAnchor: "A1",
        },
        // API box
        {
            type: "text",
            x: 0, y: boxH + gap,
            width: boxW, height: boxH,
            content: "API",
            border: { enabled: true },
            horizontalAlign: "center",
            verticalAlign: "middle",
        },
        // Connector: API -> Database
        {
            type: "line",
            points: [
                { x: 5, y: boxH + gap + boxH },
                { x: 5, y: boxH + gap + boxH + gap - 1 },
            ],
            stroke: { enabled: true },
            endAnchor: "A1",
        },
        // Database box
        {
            type: "text",
            x: 0, y: (boxH + gap) * 2,
            width: boxW, height: boxH,
            content: "Database",
            border: { enabled: true },
            horizontalAlign: "center",
            verticalAlign: "middle",
        },
    ]

    it("produces non-empty output", () => {
        const result = renderShapes(shapes)
        expect(result.length).toBeGreaterThan(0)
    })

    it("contains all three box labels", () => {
        const result = renderShapes(shapes)
        expect(result).toContain("Frontend")
        expect(result).toContain("API")
        expect(result).toContain("Database")
    })

    it("contains box-drawing border characters", () => {
        const result = renderShapes(shapes)
        // Three boxes => 3 TL and 3 BR corners minimum
        expect(count(result, TL)).toBeGreaterThanOrEqual(3)
        expect(count(result, BR)).toBeGreaterThanOrEqual(3)
    })

    it("contains arrow characters on connectors", () => {
        const result = renderShapes(shapes)
        // Two downward arrows
        expect(count(result, ARROW_DOWN)).toBe(2)
    })

    it("has expected vertical extent (15 rows: 3 boxes * 3h + 2 gaps * 3)", () => {
        const result = renderShapes(shapes)
        // 3 boxes of height 3 + 2 gaps of 3 = 15 rows
        expect(lines(result).length).toBe(15)
    })

    it("has expected width equal to box width", () => {
        const result = renderShapes(shapes)
        expect(maxWidth(result)).toBe(boxW)
    })
})

// ===========================================================================
// 2. Flowchart
// ===========================================================================

describe("Integration: Flowchart", () => {
    // Simulated flowchart:
    //   [Start] ---> [Decision?] --(yes)--> [Action A]
    //                     |
    //                   (no)
    //                     |
    //                     v
    //                [Action B]
    //
    // We use rectangles for all boxes (diamonds not natively supported).
    // Connections via lines with arrows.

    const shapes: ShapeDescription[] = [
        // Start box
        {
            type: "text",
            x: 0, y: 0,
            width: 9, height: 3,
            content: "Start",
            border: { enabled: true },
            horizontalAlign: "center",
            verticalAlign: "middle",
        },
        // Horizontal line: Start -> Decision
        {
            type: "line",
            points: [{ x: 9, y: 1 }, { x: 12, y: 1 }],
            stroke: { enabled: true },
            endAnchor: "A1",
        },
        // Decision box
        {
            type: "text",
            x: 13, y: 0,
            width: 12, height: 3,
            content: "Decision?",
            border: { enabled: true },
            horizontalAlign: "center",
            verticalAlign: "middle",
        },
        // Horizontal line: Decision -> Action A (yes path)
        {
            type: "line",
            points: [{ x: 25, y: 1 }, { x: 28, y: 1 }],
            stroke: { enabled: true },
            endAnchor: "A1",
        },
        // Action A box
        {
            type: "text",
            x: 29, y: 0,
            width: 12, height: 3,
            content: "Action A",
            border: { enabled: true },
            horizontalAlign: "center",
            verticalAlign: "middle",
        },
        // Vertical line: Decision -> Action B (no path)
        {
            type: "line",
            points: [{ x: 19, y: 3 }, { x: 19, y: 6 }],
            stroke: { enabled: true },
            endAnchor: "A1",
        },
        // Action B box
        {
            type: "text",
            x: 13, y: 7,
            width: 12, height: 3,
            content: "Action B",
            border: { enabled: true },
            horizontalAlign: "center",
            verticalAlign: "middle",
        },
    ]

    it("produces non-empty output", () => {
        const result = renderShapes(shapes)
        expect(result.length).toBeGreaterThan(0)
    })

    it("contains all labels", () => {
        const result = renderShapes(shapes)
        expect(result).toContain("Start")
        expect(result).toContain("Decision?")
        expect(result).toContain("Action A")
        expect(result).toContain("Action B")
    })

    it("has both horizontal and vertical arrows", () => {
        const result = renderShapes(shapes)
        // 2 right-pointing arrows (Start->Decision, Decision->ActionA)
        expect(count(result, ARROW_RIGHT)).toBe(2)
        // 1 downward arrow (Decision->ActionB)
        expect(count(result, ARROW_DOWN)).toBe(1)
    })

    it("spans multiple rows for the vertical branch", () => {
        const result = renderShapes(shapes)
        // Action B box ends at y=9, so at least 10 lines
        expect(lines(result).length).toBeGreaterThanOrEqual(10)
    })

    it("spans the full width across all boxes", () => {
        const result = renderShapes(shapes)
        // Action A ends at x=40 (29 + 12 - 1 = 40), so width >= 41
        expect(maxWidth(result)).toBeGreaterThanOrEqual(41)
    })
})

// ===========================================================================
// 3. Canvas workflow (incremental build)
// ===========================================================================

describe("Integration: Canvas workflow", () => {
    let cm: CanvasManager
    let canvasId: string

    beforeEach(() => {
        cm = new CanvasManager()
        canvasId = cm.create("workflow-diagram")
    })

    it("builds a diagram incrementally", () => {
        // Step 1: Add a single box
        const box1Id = cm.addShape(canvasId, {
            type: "text",
            x: 0, y: 0,
            width: 10, height: 3,
            content: "Box One",
            border: { enabled: true },
            horizontalAlign: "center",
            verticalAlign: "middle",
        })

        const render1 = cm.render(canvasId)
        expect(render1).toContain("Box One")
        expect(render1).toContain(TL)
        expect(lines(render1).length).toBe(3)

        // Step 2: Add text inside the box area (overlapping borderless text)
        // This simulates adding a label annotation below
        const labelId = cm.addShape(canvasId, {
            type: "text",
            x: 0, y: 3,
            content: "primary",
            border: { enabled: false },
            horizontalAlign: "left",
            verticalAlign: "top",
        })

        const render2 = cm.render(canvasId)
        expect(render2).toContain("Box One")
        expect(render2).toContain("primary")
        expect(lines(render2).length).toBe(4)

        // Step 3: Add a second box with a connecting line
        const box2Id = cm.addShape(canvasId, {
            type: "text",
            x: 15, y: 0,
            width: 10, height: 3,
            content: "Box Two",
            border: { enabled: true },
            horizontalAlign: "center",
            verticalAlign: "middle",
        })

        cm.addShape(canvasId, {
            type: "line",
            points: [{ x: 10, y: 1 }, { x: 14, y: 1 }],
            stroke: { enabled: true },
            endAnchor: "A1",
        })

        const render3 = cm.render(canvasId)
        expect(render3).toContain("Box One")
        expect(render3).toContain("Box Two")
        expect(render3).toContain(ARROW_RIGHT)
        // Width now spans both boxes + connector
        expect(maxWidth(render3)).toBeGreaterThanOrEqual(25)

        // Step 4: Modify first box size (make it wider)
        cm.modifyShape(canvasId, box1Id, { width: 12 })

        const render4 = cm.render(canvasId)
        expect(render4).toContain("Box One")
        // Verify the box is now wider - the first line should have at least 12 chars
        // from the first box border
        const firstLine = lines(render4)[0]!
        // Count horizontal border chars in first 12 cols - should include corners + H chars
        expect(firstLine.length).toBeGreaterThanOrEqual(12)
    })

    it("tracks multiple canvases independently", () => {
        const canvas2 = cm.create("other-diagram")

        cm.addShape(canvasId, {
            type: "text", x: 0, y: 0, content: "AAA",
            border: { enabled: false }, horizontalAlign: "left", verticalAlign: "top",
        })
        cm.addShape(canvas2, {
            type: "text", x: 0, y: 0, content: "BBB",
            border: { enabled: false }, horizontalAlign: "left", verticalAlign: "top",
        })

        expect(cm.render(canvasId)).toBe("AAA")
        expect(cm.render(canvas2)).toBe("BBB")
    })

    it("clearing a canvas removes all shapes", () => {
        cm.addShape(canvasId, {
            type: "rectangle", x: 0, y: 0, width: 5, height: 3,
            border: { enabled: true },
        })
        cm.addShape(canvasId, {
            type: "rectangle", x: 10, y: 0, width: 5, height: 3,
            border: { enabled: true },
        })

        expect(cm.render(canvasId).length).toBeGreaterThan(0)
        cm.clear(canvasId)
        expect(cm.render(canvasId)).toBe("")
    })
})

// ===========================================================================
// 4. Style showcase
// ===========================================================================

describe("Integration: Style showcase", () => {
    // Render multiple styled rectangles side by side to verify each style
    // produces distinct output characters.

    const shapes: ShapeDescription[] = [
        // S1 thin border (default)
        {
            type: "rectangle",
            x: 0, y: 0,
            width: 6, height: 3,
            border: { enabled: true, style: "S1" },
        },
        // S2 bold border
        {
            type: "rectangle",
            x: 8, y: 0,
            width: 6, height: 3,
            border: { enabled: true, style: "S2" },
        },
        // S3 double border
        {
            type: "rectangle",
            x: 16, y: 0,
            width: 6, height: 3,
            border: { enabled: true, style: "S3" },
        },
        // S4 rounded corners (S1 + rounded flag)
        {
            type: "rectangle",
            x: 24, y: 0,
            width: 6, height: 3,
            border: { enabled: true, corner: "rounded" },
        },
        // F2 filled rectangle
        {
            type: "rectangle",
            x: 32, y: 0,
            width: 6, height: 3,
            border: { enabled: true },
            fill: { enabled: true, style: "F2" },
        },
        // Line with arrow anchors
        {
            type: "line",
            points: [{ x: 0, y: 5 }, { x: 20, y: 5 }],
            stroke: { enabled: true },
            endAnchor: "A1",
        },
    ]

    it("produces non-empty output", () => {
        const result = renderShapes(shapes)
        expect(result.length).toBeGreaterThan(0)
    })

    it("contains thin border characters (S1)", () => {
        const result = renderShapes(shapes)
        expect(result).toContain(TL)
        expect(result).toContain(H)
        expect(result).toContain(V)
    })

    it("contains bold border characters (S2)", () => {
        const result = renderShapes(shapes)
        expect(result).toContain(BTL)
        expect(result).toContain(BH)
        expect(result).toContain(BV)
    })

    it("contains double border characters (S3)", () => {
        const result = renderShapes(shapes)
        expect(result).toContain(DTL)
        expect(result).toContain(DH)
        expect(result).toContain(DV)
    })

    it("contains rounded corner characters (S4)", () => {
        const result = renderShapes(shapes)
        expect(result).toContain(RTL)
        expect(result).toContain(RTR)
        expect(result).toContain(RBL)
        expect(result).toContain(RBR)
    })

    it("contains fill block character (F2)", () => {
        const result = renderShapes(shapes)
        expect(result).toContain(FILL_BLOCK)
    })

    it("contains arrow on the line", () => {
        const result = renderShapes(shapes)
        expect(result).toContain(ARROW_RIGHT)
    })

    it("renders across the expected width (fill box ends at x=37)", () => {
        const result = renderShapes(shapes)
        expect(maxWidth(result)).toBeGreaterThanOrEqual(37)
    })

    it("all five distinct corner styles are present", () => {
        const result = renderShapes(shapes)
        // Each style has a unique top-left corner
        const topLeftCorners = [TL, BTL, DTL, RTL]
        for (const corner of topLeftCorners) {
            expect(result).toContain(corner)
        }
    })
})

// ===========================================================================
// 5. Text alignment matrix
// ===========================================================================

describe("Integration: Text alignment matrix", () => {
    // 9 text boxes, one for each (horizontal x vertical) alignment combo.
    // Each box is 10x5 (inner 8x3), containing a short label.

    const boxW = 10
    const boxH = 5
    const hAligns: Array<"left" | "center" | "right"> = ["left", "center", "right"]
    const vAligns: Array<"top" | "middle" | "bottom"> = ["top", "middle", "bottom"]

    const shapes: ShapeDescription[] = []
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            const label = `${hAligns[col]![0]}${vAligns[row]![0]}`  // e.g. "lt", "cm", "rb"
            shapes.push({
                type: "text",
                x: col * (boxW + 1),
                y: row * (boxH + 1),
                width: boxW,
                height: boxH,
                content: label,
                border: { enabled: true },
                horizontalAlign: hAligns[col],
                verticalAlign: vAligns[row],
            })
        }
    }

    it("produces non-empty output", () => {
        const result = renderShapes(shapes)
        expect(result.length).toBeGreaterThan(0)
    })

    it("contains all 9 alignment labels", () => {
        const result = renderShapes(shapes)
        for (const v of vAligns) {
            for (const h of hAligns) {
                const label = `${h[0]}${v[0]}`
                expect(result).toContain(label)
            }
        }
    })

    it("has expected row count: 3 rows of 5h boxes + 2 row gaps", () => {
        const result = renderShapes(shapes)
        // 3 * 5 + 2 * 1 = 17 rows
        expect(lines(result).length).toBe(17)
    })

    it("has expected column count: 3 cols of 10w boxes + 2 col gaps", () => {
        const result = renderShapes(shapes)
        // 3 * 10 + 2 * 1 = 32 columns max
        expect(maxWidth(result)).toBe(32)
    })

    it("left-aligned text starts at left inner edge", () => {
        const result = renderShapes(shapes)
        const ls = lines(result)
        // First box row (top-aligned, left): text at row 1 (y=1) should start with V + label
        // x=0, inner starts at col 1
        const topLeftRow = ls[1]!  // row index 1 within first box
        // After TL corner: content starts at index 1
        expect(topLeftRow[1]).toBe("l")
    })

    it("right-aligned text ends at right inner edge", () => {
        const result = renderShapes(shapes)
        const ls = lines(result)
        // Third box in first row (right-aligned, top): x=22, inner right edge at x=30
        // Text "rt" (2 chars) right-aligned in 8-wide inner => ends at inner right
        const topRightRow = ls[1]!
        // The box at x=22 has border at 22 and 31, inner is 23..30
        // "rt" right-aligned in 8 chars => at positions 29,30
        expect(topRightRow[29]).toBe("r")
        expect(topRightRow[30]).toBe("t")
    })
})

// ===========================================================================
// 6. Crossing lines
// ===========================================================================

describe("Integration: Crossing lines", () => {
    // Grid of horizontal and vertical lines creating a crosshatch pattern.
    // 3 horizontal lines at y=0, y=4, y=8
    // 3 vertical lines at x=0, x=6, x=12
    // This produces 9 intersection points.

    const gridW = 12
    const gridH = 8
    const shapes: ShapeDescription[] = [
        // Horizontal lines
        { type: "line", points: [{ x: 0, y: 0 }, { x: gridW, y: 0 }], stroke: { enabled: true } },
        { type: "line", points: [{ x: 0, y: 4 }, { x: gridW, y: 4 }], stroke: { enabled: true } },
        { type: "line", points: [{ x: 0, y: 8 }, { x: gridW, y: 8 }], stroke: { enabled: true } },
        // Vertical lines
        { type: "line", points: [{ x: 0, y: 0 }, { x: 0, y: gridH }], stroke: { enabled: true } },
        { type: "line", points: [{ x: 6, y: 0 }, { x: 6, y: gridH }], stroke: { enabled: true } },
        { type: "line", points: [{ x: 12, y: 0 }, { x: 12, y: gridH }], stroke: { enabled: true } },
    ]

    it("produces non-empty output", () => {
        const result = renderShapes(shapes)
        expect(result.length).toBeGreaterThan(0)
    })

    it("has correct dimensions", () => {
        const result = renderShapes(shapes)
        expect(lines(result).length).toBe(9)     // y: 0..8
        expect(maxWidth(result)).toBe(13)         // x: 0..12
    })

    it("contains cross junction characters at interior intersections", () => {
        const result = renderShapes(shapes)
        const ls = lines(result)
        // Interior crossing at (6, 4) should be a full cross ┼
        expect(ls[4]![6]).toBe(CROSS)
    })

    it("contains corner characters at grid corners", () => {
        const result = renderShapes(shapes)
        const ls = lines(result)
        // The four outermost corners of the grid produce corner-like junctions.
        // (0,0): has right + bottom => ┌
        expect(ls[0]![0]).toBe(TL)
        // (12,0): has left + bottom => ┐
        expect(ls[0]![12]).toBe(TR)
        // (0,8): has right + top => └
        expect(ls[8]![0]).toBe(BL)
        // (12,8): has left + top => ┘
        expect(ls[8]![12]).toBe(BR)
    })

    it("contains T-junction characters on edges", () => {
        const result = renderShapes(shapes)
        const ls = lines(result)
        // (6, 0): top row, middle vertical => ┬ (horizontal with downward branch)
        expect(ls[0]![6]).toBe(T_DOWN)
        // (6, 8): bottom row, middle vertical => ┴ (horizontal with upward branch)
        expect(ls[8]![6]).toBe(T_UP)
        // (0, 4): left column, middle horizontal => ├ (vertical with rightward branch)
        expect(ls[4]![0]).toBe(T_RIGHT)
        // (12, 4): right column, middle horizontal => ┤ (vertical with leftward branch)
        expect(ls[4]![12]).toBe(T_LEFT)
    })

    it("contains horizontal line characters between intersections", () => {
        const result = renderShapes(shapes)
        const ls = lines(result)
        // Between (1,0) and (5,0) should all be horizontal line chars
        for (let x = 1; x <= 5; x++) {
            expect(ls[0]![x]).toBe(H)
        }
    })

    it("contains vertical line characters between intersections", () => {
        const result = renderShapes(shapes)
        const ls = lines(result)
        // Between (0,1) and (0,3) should all be vertical line chars
        for (let y = 1; y <= 3; y++) {
            expect(ls[y]![0]).toBe(V)
        }
    })
})
