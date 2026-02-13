/*
 * Copyright (c) 2024, tuanchauict
 */

import { Size } from "../../../src/engine/geo/size.ts";
import { RectangleExtra, TextExtra } from "../../../src/engine/style/shape-extra.ts";
import { ShapeExtraManager } from "../../../src/engine/style/extra-manager.ts";
import { TextBitmapFactory } from "../../../src/engine/bitmap/text-bitmap-factory.ts";
import { TextAlign, TextHorizontalAlign, TextVerticalAlign } from "../../../src/engine/style/style.ts";
import { describe, it, expect } from "bun:test";

function trimIndent(str: string): string {
    const lines = str.split('\n');
    const nonEmptyLines = lines.filter(line => line.trim().length > 0);
    const indentLengths = nonEmptyLines.map(line => line.match(/^\s*/)?.[0].length ?? 0);
    const minIndent = Math.min(...indentLengths);
    return lines.map(line => line.slice(minIndent)).join('\n').trim();
}

/**
 * Simulates the text wrapping/renderable text logic from the Text shape.
 * Given raw text and a max width (content area inside border), wraps lines
 * to fit.
 */
function getRenderableText(rawText: string, maxWidth: number): string[] {
    const lines = rawText.split('\n');
    const result: string[] = [];
    for (const line of lines) {
        if (line.length <= maxWidth) {
            result.push(line);
        } else {
            for (let i = 0; i < line.length; i += maxWidth) {
                result.push(line.substring(i, i + maxWidth));
            }
        }
    }
    return result;
}

describe('TextBitmapFactory', () => {
    it('toBitmap', () => {
        const boundSize = Size.of(7, 5);
        const boundExtra = RectangleExtra.create(ShapeExtraManager.defaultRectangleExtra);
        const textAlign = new TextAlign(TextHorizontalAlign.MIDDLE, TextVerticalAlign.MIDDLE);
        const extra = new TextExtra(boundExtra, textAlign);

        // Simulate text wrapping for "012345678\nabc" in a 7x5 box with border
        // Content area is 5 wide (7 - 2 for border), so "012345678" wraps to ["01234", "5678 "]
        // and "abc" stays as is.
        // The original test uses Text.setText('012345678\nabc') with getRenderableText()
        // which wraps to content width = boundSize.width - 2 (for border) = 5
        const renderableText = getRenderableText('012345678\nabc', 5);

        const bitmap = TextBitmapFactory.toBitmap(boundSize, renderableText, extra, false);
        expect(bitmap.toString().trim()).toBe(
            trimIndent(`
            \u250C\u2500\u2500\u2500\u2500\u2500\u2510
            \u250201234\u2502
            \u25025678 \u2502
            \u2502 abc \u2502
            \u2514\u2500\u2500\u2500\u2500\u2500\u2518
            `),
        );
    });
});
