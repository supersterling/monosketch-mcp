# monosketch-mcp

An MCP server that gives AI agents the ability to create beautiful ASCII diagrams using Unicode box-drawing characters. Built on the rendering engine from [MonoSketch](https://github.com/nicecoder97/nicecoder97.github.io).

```
┌──────────────────┐       ┌──────────────────┐
│                  │       │                  │
│     Frontend     │──────▶│      API         │
│                  │       │                  │
└──────────────────┘       └────────┬─────────┘
                                    │
                                    │
                           ┌────────▼─────────┐
                           │                  │
                           │    Database      │
                           │                  │
                           └──────────────────┘
```

## Setup

Requires [Bun](https://bun.sh) runtime.

```bash
git clone https://github.com/supersterling/monosketch-mcp.git
cd monosketch-mcp
bun install
```

### Add to Claude Code

```bash
claude mcp add monosketch -- bun run /path/to/monosketch-mcp/index.ts
```

### Add to Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "monosketch": {
      "command": "bun",
      "args": ["run", "/path/to/monosketch-mcp/index.ts"]
    }
  }
}
```

## Tools

### `render_scene`

Stateless one-shot rendering. Pass an array of shapes, get back ASCII art.

```json
{
  "shapes": [
    {
      "type": "rectangle",
      "x": 0, "y": 0, "width": 20, "height": 5,
      "border": { "enabled": true }
    },
    {
      "type": "text",
      "x": 0, "y": 0, "width": 20, "height": 5,
      "content": "Hello World",
      "horizontalAlign": "center",
      "verticalAlign": "middle",
      "border": { "enabled": true }
    }
  ]
}
```

Output:

```
┌──────────────────┐
│                  │
│   Hello World    │
│                  │
└──────────────────┘
```

### Canvas Tools (Stateful)

Build diagrams incrementally across multiple tool calls:

| Tool | Description |
|------|-------------|
| `create_canvas` | Create a named canvas session |
| `add_shape` | Add a shape to a canvas |
| `modify_shape` | Update shape properties |
| `remove_shape` | Remove a shape |
| `render_canvas` | Render current state to ASCII |
| `list_canvases` | List active sessions |
| `clear_canvas` | Remove all shapes |

### Utilities

| Tool | Description |
|------|-------------|
| `list_styles` | List all available border, fill, and anchor styles |
| `measure_text` | Compute bounding box for word-wrapped text |

## Shape Types

### Rectangle

```json
{ "type": "rectangle", "x": 0, "y": 0, "width": 10, "height": 4,
  "border": { "enabled": true, "style": "S1", "corner": "rounded" },
  "fill": { "enabled": true, "style": "F1" } }
```

### Text

```json
{ "type": "text", "x": 0, "y": 0, "width": 20, "height": 3,
  "content": "Centered text", "horizontalAlign": "center", "verticalAlign": "middle",
  "border": { "enabled": true } }
```

### Line

```json
{ "type": "line",
  "points": [{"x": 0, "y": 2}, {"x": 10, "y": 2}, {"x": 10, "y": 5}],
  "stroke": { "enabled": true },
  "endAnchor": "A1" }
```

### Group

```json
{ "type": "group", "children": [
  { "type": "rectangle", "x": 0, "y": 0, "width": 10, "height": 3, "border": { "enabled": true } },
  { "type": "rectangle", "x": 15, "y": 0, "width": 10, "height": 3, "border": { "enabled": true } }
]}
```

## Style Reference

### Border / Stroke Styles

| ID | Name | Characters |
|----|------|------------|
| S1 | Thin (default) | `─ │ ┌ ┐ └ ┘` |
| S2 | Bold | `━ ┃ ┏ ┓ ┗ ┛` |
| S3 | Double | `═ ║ ╔ ╗ ╚ ╝` |
| S4 | Rounded | `─ │ ╭ ╮ ╰ ╯` |

### Fill Styles

| ID | Name | Character |
|----|------|-----------|
| F1 | Space | ` ` (opaque blank) |
| F2 | Solid | `█` |
| F3 | Medium shade | `▒` |
| F4 | Light shade | `░` |
| F5 | Diagonal | `▚` |

### Anchor Styles (Line Endpoints)

| ID | Name | L R U D |
|----|------|---------|
| A1 | Filled arrow | `◀ ▶ ▲ ▼` |
| A12 | Hollow arrow | `◁ ▷ △ ▽` |
| A2 | Filled square | `■ ■ ■ ■` |
| A21 | Hollow square | `□ □ □ □` |
| A220 | Filled diamond | `◆ ◆ ◆ ◆` |
| A221 | Hollow diamond | `◇ ◇ ◇ ◇` |
| A3 | Hollow circle | `○ ○ ○ ○` |
| A5 | Filled circle | `● ● ● ●` |

### Dash Patterns

Add `"dash": { "dash": 3, "gap": 1 }` to any shape for dashed borders/strokes.

## Line Crossing

When lines cross, junction characters are automatically resolved:

```
    │
────┼────
    │
```

The engine handles all combinations of single, bold, and double line styles with correct Unicode junction characters (T-junctions, crosses, corners).

## Tests

```bash
bun test
```

208 tests covering geometry primitives, bitmap rendering, board compositing, crossing resolution, shape hierarchy, renderer pipeline, canvas management, and end-to-end integration scenarios.

## Architecture

The rendering engine was extracted from [MonoSketch](https://github.com/nicecoder97/nicecoder97.github.io), an open-source ASCII diagram editor.

```
Shape Description (JSON)
  → BitmapFactory (per shape type)
    → MonoBitmap (sparse character matrix)
      → MonoBoard (tiled canvas with crossing resolution)
        → ASCII string output
```

**Engine modules:**
- `engine/geo/` — Point, Rect, Size geometry primitives
- `engine/shape/` — Shape hierarchy (Rectangle, Text, Line, Group)
- `engine/style/` — Stroke, fill, anchor, and alignment styles
- `engine/bitmap/` — Sparse bitmap matrix and per-shape rendering factories
- `engine/board/` — Tiled canvas compositing with Unicode line crossing resolution

## License

MIT
