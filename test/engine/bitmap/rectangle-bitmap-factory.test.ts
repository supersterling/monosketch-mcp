/*
 * Copyright (c) 2024, tuanchauict
 */

import { Size } from "../../../src/engine/geo/size.ts";
import { RectangleExtra } from "../../../src/engine/style/shape-extra.ts";
import { ShapeExtraManager } from "../../../src/engine/style/extra-manager.ts";
import { RectangleBitmapFactory } from "../../../src/engine/bitmap/rectangle-bitmap-factory.ts";
import { describe, it, expect } from "bun:test";

function trimIndent(str: string): string {
    const lines = str.split('\n');
    const nonEmptyLines = lines.filter(line => line.trim().length > 0);
    const indentLengths = nonEmptyLines.map(line => line.match(/^\s*/)?.[0].length ?? 0);
    const minIndent = Math.min(...indentLengths);
    return lines.map(line => line.slice(minIndent)).join('\n').trim();
}

describe('RectangleBitmapFactory', () => {
    it('toBitmap', () => {
        const size = Size.of(5, 5);
        const extra = RectangleExtra.create(ShapeExtraManager.defaultRectangleExtra);
        const bitmap = RectangleBitmapFactory.toBitmap(size, extra);
        expect(bitmap.size.width).toBe(5);
        expect(bitmap.size.height).toBe(5);
        expect(bitmap.toString().trim()).toBe(
            trimIndent(`
            \u250C\u2500\u2500\u2500\u2510
            \u2502   \u2502
            \u2502   \u2502
            \u2502   \u2502
            \u2514\u2500\u2500\u2500\u2518
            `),
        );
    });
});
