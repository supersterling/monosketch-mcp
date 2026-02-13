import { describe, expect, test } from "bun:test";
import { PainterBoard } from "../../../src/engine/board/painter-board.ts";
import { Rect } from "../../../src/engine/geo/rect.ts";
import { HighlightType } from "../../../src/engine/board/pixel.ts";
import { Point } from "../../../src/engine/geo/point.ts";
import { TRANSPARENT_CHAR } from "../../../src/engine/common/character.ts";

describe('test painter-boards', () => {
    test('fill inside a board', () => {
        const board = new PainterBoard(Rect.byLTWH(0, 0, 4, 4));
        board.fillRect(Rect.byLTWH(1, 2, 3, 4), '#', HighlightType.NO);
        expect(board.toString()).toEqual('    \n    \n ###\n ###');
    });

    test('fill outside a board', () => {
        const board = new PainterBoard(Rect.byLTWH(1, 1, 4, 4));
        board.fillRect(Rect.byLTWH(0, 0, 5, 5), '#', HighlightType.NO);
        expect(board.toString()).toEqual('####\n####\n####\n####');
    });

    test('fill board', () => {
        const board1 = new PainterBoard(Rect.byLTWH(0, 0, 4, 4));
        board1.fillRect(Rect.byLTWH(0, 0, 2, 2), 'a', HighlightType.NO);
        board1.fillRect(Rect.byLTWH(0, 2, 2, 2), 'b', HighlightType.NO);
        board1.fillRect(Rect.byLTWH(2, 0, 2, 2), 'c', HighlightType.NO);
        board1.fillRect(Rect.byLTWH(2, 2, 2, 2), 'd', HighlightType.NO);
        board1.setPoint(new Point(2, 1), TRANSPARENT_CHAR, HighlightType.NO);

        const board2 = new PainterBoard(Rect.byLTWH(1, 1, 3, 2));
        board2.setPoint(new Point(2, 1), 'x', HighlightType.NO);
        board2.fill(board1);
        expect(board2.toString()).toBe('axc\nbdd');
    });
});
