/*
 * Copyright (c) 2024, tuanchauict
 */

import { HALF_TRANSPARENT_CHAR, NBSP, TRANSPARENT_CHAR } from "../common/character.ts";
import {
    CharDrawable,
    NinePatchDrawable,
    NinePatchDrawablePattern,
    RepeatRepeatableRange,
} from "../drawable/index.ts";
import { AnchorChar, RectangleBorderStyle, RectangleFillStyle, StraightStrokeStyle } from "./style.ts";

/**
 * An object for listing all predefined rectangle fill styles.
 */
export class PredefinedRectangleFillStyle {
    static readonly NOFILLED_STYLE = new RectangleFillStyle(
        "F0",
        "No Fill",
        new CharDrawable(TRANSPARENT_CHAR),
    );

    static readonly PREDEFINED_STYLES: RectangleFillStyle[] = [
        RectangleFillStyle.create({ id: "F1", displayName: NBSP, drawable: new CharDrawable(' ') }),
        RectangleFillStyle.create({ id: "F2", displayName: "\u2588", drawable: new CharDrawable('\u2588') }),
        RectangleFillStyle.create({ id: "F3", displayName: "\u2592", drawable: new CharDrawable('\u2592') }),
        RectangleFillStyle.create({ id: "F4", displayName: "\u2591", drawable: new CharDrawable('\u2591') }),
        RectangleFillStyle.create({ id: "F5", displayName: "\u259A", drawable: new CharDrawable('\u259A') }),
    ];

    static readonly PREDEFINED_STYLE_MAP: { [id: string]: RectangleFillStyle } = Object.fromEntries(
        PredefinedRectangleFillStyle.PREDEFINED_STYLES.map(style => [style.id, style]),
    );
}

/**
 * An object for listing all predefined StraightStrokeStyle
 */
export class PredefinedStraightStrokeStyle {
    static readonly NO_STROKE = StraightStrokeStyle.create(
        {
            id: "S0",
            displayName: "No Stroke",
            horizontal: HALF_TRANSPARENT_CHAR,
            vertical: HALF_TRANSPARENT_CHAR,
            downLeft: HALF_TRANSPARENT_CHAR,
            upRight: HALF_TRANSPARENT_CHAR,
            upLeft: HALF_TRANSPARENT_CHAR,
            downRight: HALF_TRANSPARENT_CHAR,
        },
    );

    private static readonly ALL_STYLES: StraightStrokeStyle[] = [
        PredefinedStraightStrokeStyle.NO_STROKE,
        StraightStrokeStyle.create({
            id: "S1",
            displayName: "\u2500",
            horizontal: '\u2500',
            vertical: '\u2502',
            downLeft: '\u2510',
            upRight: '\u250C',
            upLeft: '\u2518',
            downRight: '\u2514',
        }),
        StraightStrokeStyle.create({
            id: "S2",
            displayName: "\u2501",
            horizontal: '\u2501',
            vertical: '\u2503',
            downLeft: '\u2513',
            upRight: '\u250F',
            upLeft: '\u251B',
            downRight: '\u2517',
        }),
        StraightStrokeStyle.create({
            id: "S3",
            displayName: "\u2550",
            horizontal: '\u2550',
            vertical: '\u2551',
            downLeft: '\u2557',
            upRight: '\u2554',
            upLeft: '\u255D',
            downRight: '\u255A',
        }),
        StraightStrokeStyle.create({
            id: "S4",
            displayName: "\u25A2",
            horizontal: '\u2500',
            vertical: '\u2502',
            downLeft: '\u256E',
            upRight: '\u256D',
            upLeft: '\u256F',
            downRight: '\u2570',
        }),
    ];

    private static readonly ID_TO_STYLE_MAP: Map<string, StraightStrokeStyle> = new Map(
        PredefinedStraightStrokeStyle.ALL_STYLES.map(style => [style.id, style]),
    );

    private static readonly STYLE_TO_ROUNDED_CORNER_STYLE_MAP: { [id: string]: string } = {
        "S1": "S4",
    };

    static readonly PREDEFINED_STYLES: StraightStrokeStyle[] =
        ["S1", "S2", "S3"].map(id => PredefinedStraightStrokeStyle.ID_TO_STYLE_MAP.get(id)!);

    static getStyle(id: string, isRounded: boolean = false): StraightStrokeStyle | null {
        const adjustedId = isRounded ? PredefinedStraightStrokeStyle.STYLE_TO_ROUNDED_CORNER_STYLE_MAP[id] || id : id;
        return PredefinedStraightStrokeStyle.ID_TO_STYLE_MAP.get(adjustedId) ?? null;
    }

    static isCornerRoundable(id: string | null | undefined): boolean {
        if (id === null || id === undefined) {
            return false;
        }
        return id in PredefinedStraightStrokeStyle.STYLE_TO_ROUNDED_CORNER_STYLE_MAP;
    }
}

/**
 * An object for listing all predefined anchor chars.
 */
export class PredefinedAnchorChar {
    static readonly PREDEFINED_ANCHOR_CHARS: AnchorChar[] = [
        AnchorChar.create({ id: "A1", displayName: "\u25B6", left: '\u25C0', right: '\u25B6', top: '\u25B2', bottom: '\u25BC' }),
        AnchorChar.create({ id: "A12", displayName: "\u25B7", left: '\u25C1', right: '\u25B7', top: '\u25B3', bottom: '\u25BD' }),
        AnchorChar.create({ id: "A13", displayName: "\u25BA", left: '\u25C4', right: '\u25BA', top: '\u25B2', bottom: '\u25BC' }),
        AnchorChar.create({ id: "A14", displayName: "\u25BB", left: '\u25C5', right: '\u25BB', top: '\u25B3', bottom: '\u25BD' }),
        AnchorChar.create({ id: "A2", displayName: "\u25A0", all: '\u25A0' }),
        AnchorChar.create({ id: "A21", displayName: "\u25A1", all: '\u25A1' }),
        AnchorChar.create({ id: "A220", displayName: "\u25C6", all: '\u25C6' }),
        AnchorChar.create({ id: "A221", displayName: "\u25C7", all: '\u25C7' }),
        AnchorChar.create({ id: "A3", displayName: "\u25CB", all: '\u25CB' }),
        AnchorChar.create({ id: "A4", displayName: "\u25CE", all: '\u25CE' }),
        AnchorChar.create({ id: "A5", displayName: "\u25CF", all: '\u25CF' }),
        AnchorChar.create({ id: "A6", displayName: "\u251C", left: '\u251C', right: '\u2524', top: '\u252C', bottom: '\u2534' }),
        AnchorChar.create({ id: "A61", displayName: "\u2523", left: '\u2523', right: '\u252B', top: '\u2533', bottom: '\u253B' }),
        AnchorChar.create({ id: "A62", displayName: "\u2560", left: '\u2560', right: '\u2563', top: '\u2566', bottom: '\u2569' }),
    ];

    static readonly PREDEFINED_ANCHOR_CHAR_MAP: { [id: string]: AnchorChar } = Object.fromEntries(
        PredefinedAnchorChar.PREDEFINED_ANCHOR_CHARS.map(char => [char.id, char]),
    );
}

/**
 * An object for listing all predefined rectangle border styles.
 */
export class PredefinedRectangleBorderStyle {
    private static readonly PATTERN_TEXT_NO_BORDER = `\
${HALF_TRANSPARENT_CHAR}${HALF_TRANSPARENT_CHAR}${HALF_TRANSPARENT_CHAR}
${HALF_TRANSPARENT_CHAR} ${HALF_TRANSPARENT_CHAR}
${HALF_TRANSPARENT_CHAR}${HALF_TRANSPARENT_CHAR}${HALF_TRANSPARENT_CHAR}`;

    private static readonly PATTERN_TEXT_0 = `\
\u250C\u2500\u2510
\u2502 \u2502
\u2514\u2500\u2518`;

    private static readonly PATTERN_TEXT_1 = `\
\u250F\u2501\u2513
\u2503 \u2503
\u2517\u2501\u251B`;

    private static readonly PATTERN_TEXT_2 = `\
\u2554\u2550\u2557
\u2551 \u2551
\u255A\u2550\u255D`;

    private static readonly REPEATABLE_RANGE_0 = new RepeatRepeatableRange(1, 1);

    static readonly NO_BORDER = new RectangleBorderStyle(
        "B0",
        "No border",
        new NinePatchDrawable(
            NinePatchDrawablePattern.fromText(PredefinedRectangleBorderStyle.PATTERN_TEXT_NO_BORDER),
            PredefinedRectangleBorderStyle.REPEATABLE_RANGE_0,
            PredefinedRectangleBorderStyle.REPEATABLE_RANGE_0,
        ),
    );

    static readonly PREDEFINED_STYLES: RectangleBorderStyle[] = [
        new RectangleBorderStyle(
            "B1",
            "\u2500",
            new NinePatchDrawable(
                NinePatchDrawablePattern.fromText(PredefinedRectangleBorderStyle.PATTERN_TEXT_0),
                PredefinedRectangleBorderStyle.REPEATABLE_RANGE_0,
                PredefinedRectangleBorderStyle.REPEATABLE_RANGE_0,
            ),
        ),
        new RectangleBorderStyle(
            "B2",
            "\u2501",
            new NinePatchDrawable(
                NinePatchDrawablePattern.fromText(PredefinedRectangleBorderStyle.PATTERN_TEXT_1),
                PredefinedRectangleBorderStyle.REPEATABLE_RANGE_0,
                PredefinedRectangleBorderStyle.REPEATABLE_RANGE_0,
            ),
        ),
        new RectangleBorderStyle(
            "B3",
            "\u2550",
            new NinePatchDrawable(
                NinePatchDrawablePattern.fromText(PredefinedRectangleBorderStyle.PATTERN_TEXT_2),
                PredefinedRectangleBorderStyle.REPEATABLE_RANGE_0,
                PredefinedRectangleBorderStyle.REPEATABLE_RANGE_0,
            ),
        ),
    ];

    static readonly PREDEFINED_STYLE_MAP: { [id: string]: RectangleBorderStyle } = Object.fromEntries(
        PredefinedRectangleBorderStyle.PREDEFINED_STYLES.map(style => [style.id, style]),
    );
}
