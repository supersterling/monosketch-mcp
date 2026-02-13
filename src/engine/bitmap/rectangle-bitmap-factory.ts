/*
 * Copyright (c) 2024, tuanchauict
 */

import type { Size } from "../geo/size.ts";
import { MonoBitmap } from "./monobitmap.ts";
import { PredefinedStraightStrokeStyle } from "../style/predefined-styles.ts";
import type { RectangleExtra } from "../style/shape-extra.ts";
import { type StraightStrokeDashPattern, type StraightStrokeStyle } from "../style/style.ts";
import { PointChar } from "./point-char.ts";

/**
 * A factory class to create a bitmap for a rectangle shape.
 */
export class RectangleBitmapFactory {
    static toBitmap(size: Size, extra: RectangleExtra): MonoBitmap.Bitmap {
        const bitmapBuilder = new MonoBitmap.Builder(size.width, size.height);

        const fillDrawable = extra.fillStyle?.drawable ?? null;
        const strokeStyle = extra.strokeStyle;

        if (fillDrawable === null && strokeStyle === null) {
            // Draw a half transparent character for selection.
            // Half transparent is not displayed on the canvas but makes the shape selectable.
            this.drawBorder(bitmapBuilder, size, PredefinedStraightStrokeStyle.NO_STROKE, extra.dashPattern);
            return bitmapBuilder.toBitmap();
        }

        if (fillDrawable) {
            bitmapBuilder.fillBitmap(0, 0, fillDrawable.toBitmap(size.width, size.height));
        }

        const isStrokeAllowed = fillDrawable === null || (size.width > 1 && size.height > 1);
        if (isStrokeAllowed && strokeStyle !== null) {
            this.drawBorder(bitmapBuilder, size, strokeStyle, extra.dashPattern);
        }

        return bitmapBuilder.toBitmap();
    }

    private static drawBorder(
        bitmapBuilder: MonoBitmap.Builder,
        size: Size,
        strokeStyle: StraightStrokeStyle,
        dashPattern: StraightStrokeDashPattern,
    ) {
        if (size.width === 1 && size.height === 1) {
            bitmapBuilder.put(0, 0, '\u25A1', '\u25A1');
            return;
        }

        const pointChars = this.getBorderPointChars(size, strokeStyle);

        pointChars.flat().forEach((pointChar, index) => {
            const visualChar = dashPattern.isGap(index) ? ' ' : pointChar.char;
            bitmapBuilder.put(pointChar.top, pointChar.left, visualChar, pointChar.char);
        });
    }

    private static getBorderPointChars(size: Size, strokeStyle: StraightStrokeStyle) {
        const left = 0;
        const top = 0;
        const right = size.width - 1;
        const bottom = size.height - 1;

        if (size.width === 1) {
            return [PointChar.verticalLine(left, top - 1, bottom, strokeStyle.vertical)];
        }
        if (size.height === 1) {
            return [PointChar.horizontalLine(left - 1, right, top, strokeStyle.horizontal)];
        }
        return [
            PointChar.point(left, top, strokeStyle.upRight),
            PointChar.horizontalLine(left, right, top, strokeStyle.horizontal),
            PointChar.point(right, top, strokeStyle.downLeft),
            PointChar.verticalLine(right, top, bottom, strokeStyle.vertical),
            PointChar.point(right, bottom, strokeStyle.upLeft),
            PointChar.horizontalLine(right, left, bottom, strokeStyle.horizontal),
            PointChar.point(left, bottom, strokeStyle.downRight),
            PointChar.verticalLine(left, bottom, top, strokeStyle.vertical),
        ];
    }
}
