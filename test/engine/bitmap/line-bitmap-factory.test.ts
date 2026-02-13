/*
 * Copyright (c) 2024, tuanchauict
 */

import { Point } from "../../../src/engine/geo/point.ts";
import { PredefinedStraightStrokeStyle } from "../../../src/engine/style/predefined-styles.ts";
import { LineBitmapFactory } from "../../../src/engine/bitmap/line-bitmap-factory.ts";
import { LineExtra } from "../../../src/engine/style/shape-extra.ts";
import { AnchorChar, StraightStrokeDashPattern } from "../../../src/engine/style/style.ts";
import { describe, it, expect } from "bun:test";

function trimIndent(str: string): string {
    const lines = str.split('\n');
    const nonEmptyLines = lines.filter(line => line.trim().length > 0);
    const indentLengths = nonEmptyLines.map(line => line.match(/^\s*/)?.[0].length ?? 0);
    const minIndent = Math.min(...indentLengths);
    return lines.map(line => line.slice(minIndent)).join('\n').trim();
}

function trimMargin(input: string, marginPrefix: string = '|'): string {
    const lines = input.split('\n').filter(line => line.indexOf(marginPrefix) !== -1);
    if (!lines.length) {
        return input;
    }
    const marginLength = lines[0].indexOf(marginPrefix) + 1;
    return lines.map(line => line.slice(marginLength)).join('\n');
}

const LINE_EXTRA = new LineExtra(
    true,
    PredefinedStraightStrokeStyle.PREDEFINED_STYLES[0],
    true,
    AnchorChar.create({ id: 'id', displayName: 'name', all: '0' }),
    true,
    AnchorChar.create({ id: 'id', displayName: 'name', all: '1' }),
    StraightStrokeDashPattern.SOLID,
    false,
);

describe('LineBitmapFactory.toBitmap', () => {
    describe('simpleHorizontalLine', () => {
        it('simpleHorizontalLine', () => {
            const points = [
                new Point(2, 0),
                new Point(6, 0),
            ];
            const bitmap = LineBitmapFactory.toBitmap(points, LINE_EXTRA);
            expect(bitmap.toString()).toBe('0\u2500\u2500\u25001');
        });

        it('simpleHorizontalLine_reversed', () => {
            const points = [
                new Point(6, 0),
                new Point(2, 0),
            ];
            const bitmap = LineBitmapFactory.toBitmap(points, LINE_EXTRA);
            expect(bitmap.toString()).toBe('1\u2500\u2500\u25000');
        });
    });

    describe('3 straight horizontal points', () => {
        it('MonotonicPoints', () => {
            const points = [
                new Point(0, 0),
                new Point(2, 0),
                new Point(4, 0),
            ];
            const bitmap = LineBitmapFactory.toBitmap(points, LINE_EXTRA);
            expect(bitmap.toString()).toBe('0\u2500\u2500\u25001');
        });

        it('MonotonicPoints_reversed', () => {
            const points = [
                new Point(4, 0),
                new Point(2, 0),
                new Point(0, 0),
            ];
            const bitmap = LineBitmapFactory.toBitmap(points, LINE_EXTRA);
            expect(bitmap.toString()).toBe('1\u2500\u2500\u25000');
        });

        it('NonMonotonicPoints', () => {
            const points = [
                new Point(0, 0),
                new Point(4, 0),
                new Point(2, 0),
            ];
            const bitmap = LineBitmapFactory.toBitmap(points, LINE_EXTRA);
            expect(bitmap.toString()).toBe('0\u25001\u2500\u2500');
        });

        it('NonMonotonicPoints_reversed', () => {
            const points = [
                new Point(4, 0),
                new Point(0, 0),
                new Point(2, 0),
            ];
            const bitmap = LineBitmapFactory.toBitmap(points, LINE_EXTRA);
            expect(bitmap.toString()).toBe('\u2500\u25001\u25000');
        });
    });

    describe('simpleVerticalLine', () => {
        it('simpleVerticalLine', () => {
            const points = [
                new Point(0, 2),
                new Point(0, 6),
            ];
            const bitmap = LineBitmapFactory.toBitmap(points, LINE_EXTRA);
            expect(bitmap.toString()).toBe(
                trimIndent(`
                0
                \u2502
                \u2502
                \u2502
                1
            `),
            );
        });

        it('simpleVerticalLine_reversed', () => {
            const points = [
                new Point(0, 6),
                new Point(0, 2),
            ];
            const bitmap = LineBitmapFactory.toBitmap(points, LINE_EXTRA);
            expect(bitmap.toString()).toBe(
                trimIndent(`
                1
                \u2502
                \u2502
                \u2502
                0
            `),
            );
        });
    });

    describe('3 straight vertical points', () => {
        it('MonotonicPoints', () => {
            const points = [
                new Point(0, 0),
                new Point(0, 2),
                new Point(0, 4),
            ];
            const bitmap = LineBitmapFactory.toBitmap(points, LINE_EXTRA);
            expect(bitmap.toString()).toBe(
                trimIndent(`
                0
                \u2502
                \u2502
                \u2502
                1
            `),
            );
        });

        it('MonotonicPoints_reversed', () => {
            const points = [
                new Point(0, 4),
                new Point(0, 2),
                new Point(0, 0),
            ];
            const bitmap = LineBitmapFactory.toBitmap(points, LINE_EXTRA);
            expect(bitmap.toString()).toBe(
                trimIndent(`
                1
                \u2502
                \u2502
                \u2502
                0
            `),
            );
        });

        it('NonMonotonicPoints', () => {
            const points = [
                new Point(0, 0),
                new Point(0, 4),
                new Point(0, 2),
            ];
            const bitmap = LineBitmapFactory.toBitmap(points, LINE_EXTRA);
            expect(bitmap.toString()).toBe(
                trimIndent(`
                0
                \u2502
                1
                \u2502
                \u2502
            `),
            );
        });

        it('NonMonotonicPoints_reversed', () => {
            const points = [
                new Point(0, 4),
                new Point(0, 0),
                new Point(0, 2),
            ];
            const bitmap = LineBitmapFactory.toBitmap(points, LINE_EXTRA);
            expect(bitmap.toString()).toBe(
                trimIndent(`
                \u2502
                \u2502
                1
                \u2502
                0
            `),
            );
        });
    });

    describe('upperLeft', () => {
        it('upperLeft', () => {
            const points = [
                new Point(0, 4),
                new Point(4, 4),
                new Point(4, 0),
            ];
            const bitmap = LineBitmapFactory.toBitmap(points, LINE_EXTRA);
            expect(bitmap.toString()).toBe(
                trimMargin(`
                |    1
                |    \u2502
                |    \u2502
                |    \u2502
                |0\u2500\u2500\u2500\u2518
            `),
            );
        });

        it('upperLeft_reversed', () => {
            const points = [
                new Point(4, 0),
                new Point(4, 4),
                new Point(0, 4),
            ];
            const bitmap = LineBitmapFactory.toBitmap(points, LINE_EXTRA);
            expect(bitmap.toString()).toBe(
                trimMargin(`
                |    0
                |    \u2502
                |    \u2502
                |    \u2502
                |1\u2500\u2500\u2500\u2518
            `),
            );
        });
    });

    describe('lowerLeft', () => {
        it('lowerLeft', () => {
            const points = [
                new Point(0, 0),
                new Point(4, 0),
                new Point(4, 4),
            ];
            const bitmap = LineBitmapFactory.toBitmap(points, LINE_EXTRA);
            expect(bitmap.toString()).toBe(
                trimMargin(`
                |0\u2500\u2500\u2500\u2510
                |    \u2502
                |    \u2502
                |    \u2502
                |    1
            `),
            );
        });

        it('lowerLeft_reversed', () => {
            const points = [
                new Point(4, 4),
                new Point(4, 0),
                new Point(0, 0),
            ];
            const bitmap = LineBitmapFactory.toBitmap(points, LINE_EXTRA);
            expect(bitmap.toString()).toBe(
                trimMargin(`
                |1\u2500\u2500\u2500\u2510
                |    \u2502
                |    \u2502
                |    \u2502
                |    0
            `),
            );
        });
    });

    describe('upperRight', () => {
        it('upperRight', () => {
            const points = [
                new Point(4, 4),
                new Point(0, 4),
                new Point(0, 0),
            ];
            const bitmap = LineBitmapFactory.toBitmap(points, LINE_EXTRA);
            // Trailing spaces are expected: bitmap is 5 columns wide, vertical bar at col 0
            expect(bitmap.toString()).toBe(
                "1    \n\u2502    \n\u2502    \n\u2502    \n\u2514\u2500\u2500\u25000"
            );
        });

        it('upperRight_reversed', () => {
            const points = [
                new Point(0, 0),
                new Point(0, 4),
                new Point(4, 4),
            ];
            const bitmap = LineBitmapFactory.toBitmap(points, LINE_EXTRA);
            expect(bitmap.toString()).toBe(
                "0    \n\u2502    \n\u2502    \n\u2502    \n\u2514\u2500\u2500\u25001"
            );
        });
    });

    describe('lowerRight', () => {
        it('lowerRight', () => {
            const points = [
                new Point(4, 0),
                new Point(0, 0),
                new Point(0, 4),
            ];
            const bitmap = LineBitmapFactory.toBitmap(points, LINE_EXTRA);
            expect(bitmap.toString()).toBe(
                "\u250C\u2500\u2500\u25000\n\u2502    \n\u2502    \n\u2502    \n1    "
            );
        });

        it('lowerRight_reversed', () => {
            const points = [
                new Point(0, 4),
                new Point(0, 0),
                new Point(4, 0),
            ];
            const bitmap = LineBitmapFactory.toBitmap(points, LINE_EXTRA);
            expect(bitmap.toString()).toBe(
                "\u250C\u2500\u2500\u25001\n\u2502    \n\u2502    \n\u2502    \n0    "
            );
        });
    });

    describe('anchorChar', () => {
        const anchorCharStart = AnchorChar.create({
            id: 'id',
            displayName: 'name',
            left: 'L',
            right: 'R',
            top: 'T',
            bottom: 'B',
        });

        const anchorCharEnd = AnchorChar.create({
            id: 'id',
            displayName: 'name',
            left: 'l',
            right: 'r',
            top: 't',
            bottom: 'b',
        });

        it('leftToRight', () => {
            const lineExtra = LINE_EXTRA.copy({
                userSelectedStartAnchor: anchorCharStart,
                userSelectedEndAnchor: anchorCharEnd,
            });
            const points = [
                new Point(0, 0),
                new Point(4, 0),
            ];
            const bitmap = LineBitmapFactory.toBitmap(points, lineExtra);
            expect(bitmap.toString()).toBe('L\u2500\u2500\u2500r');
        });

        it('rightToLeft', () => {
            const lineExtra = LINE_EXTRA.copy({
                userSelectedStartAnchor: anchorCharStart,
                userSelectedEndAnchor: anchorCharEnd,
            });
            const points = [
                new Point(4, 0),
                new Point(0, 0),
            ];
            const bitmap = LineBitmapFactory.toBitmap(points, lineExtra);
            expect(bitmap.toString()).toBe('l\u2500\u2500\u2500R');
        });

        it('topToBottom', () => {
            const lineExtra = LINE_EXTRA.copy({
                userSelectedStartAnchor: anchorCharStart,
                userSelectedEndAnchor: anchorCharEnd,
            });
            const points = [
                new Point(0, 0),
                new Point(0, 4),
            ];
            const bitmap = LineBitmapFactory.toBitmap(points, lineExtra);
            expect(bitmap.toString()).toBe(
                trimIndent(`
                T
                \u2502
                \u2502
                \u2502
                b
            `),
            );
        });

        it('bottomToTop', () => {
            const lineExtra = LINE_EXTRA.copy({
                userSelectedStartAnchor: anchorCharStart,
                userSelectedEndAnchor: anchorCharEnd,
            });
            const points = [
                new Point(0, 4),
                new Point(0, 0),
            ];
            const bitmap = LineBitmapFactory.toBitmap(points, lineExtra);
            expect(bitmap.toString()).toBe(
                trimIndent(`
                t
                \u2502
                \u2502
                \u2502
                B
            `),
            );
        });
    });
});
