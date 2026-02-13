import type { Comparable } from "../types/comparable.ts";
import { type ILineExtra, type IRectangleExtra, ShapeExtraManager } from "./extra-manager.ts";
import { PredefinedStraightStrokeStyle } from "./predefined-styles.ts";
import {
    AnchorChar,
    RectangleBorderCornerPattern,
    RectangleFillStyle,
    StraightStrokeDashPattern,
    StraightStrokeStyle,
    TextAlign,
    TextHorizontalAlign,
    TextVerticalAlign,
} from "./style.ts";

/**
 * An interface for extra properties of a shape.
 */
export interface ShapeExtra extends Comparable {
}

export const NoExtra: ShapeExtra = {
    equals(other: unknown): boolean {
        return other === NoExtra;
    },
};

/**
 * A {@link ShapeExtra} for a line.
 */
export class LineExtra implements ShapeExtra, ILineExtra {
    constructor(
        public isStrokeEnabled: boolean,
        public userSelectedStrokeStyle: StraightStrokeStyle,
        public isStartAnchorEnabled: boolean,
        public userSelectedStartAnchor: AnchorChar,
        public isEndAnchorEnabled: boolean,
        public userSelectedEndAnchor: AnchorChar,
        public dashPattern: StraightStrokeDashPattern,
        public isRoundedCorner: boolean,
    ) {
    }

    static create(extra: ILineExtra): LineExtra {
        return new LineExtra(
            extra.isStrokeEnabled,
            extra.userSelectedStrokeStyle,
            extra.isStartAnchorEnabled,
            extra.userSelectedStartAnchor,
            extra.isEndAnchorEnabled,
            extra.userSelectedEndAnchor,
            extra.dashPattern,
            extra.isRoundedCorner,
        );
    }

    get startAnchor(): AnchorChar | null {
        return this.isStartAnchorEnabled ? this.userSelectedStartAnchor : null;
    }

    get endAnchor(): AnchorChar | null {
        return this.isEndAnchorEnabled ? this.userSelectedEndAnchor : null;
    }

    get strokeStyle(): StraightStrokeStyle | null {
        return this.isStrokeEnabled
            ? PredefinedStraightStrokeStyle.getStyle(this.userSelectedStrokeStyle.id, this.isRoundedCorner)
            : null;
    }

    equals(other: unknown): boolean {
        if (!(other instanceof LineExtra)) {
            return false;
        }
        return (
            this.isStrokeEnabled === other.isStrokeEnabled &&
            this.userSelectedStrokeStyle.id === other.userSelectedStrokeStyle.id &&
            this.isStartAnchorEnabled === other.isStartAnchorEnabled &&
            this.userSelectedStartAnchor.id === other.userSelectedStartAnchor.id &&
            this.isEndAnchorEnabled === other.isEndAnchorEnabled &&
            this.userSelectedEndAnchor.id === other.userSelectedEndAnchor.id &&
            this.dashPattern.toSerializableValue() === other.dashPattern.toSerializableValue() &&
            this.isRoundedCorner === other.isRoundedCorner
        );
    }

    copy({
        isStrokeEnabled = this.isStrokeEnabled,
        userSelectedStrokeStyle = this.userSelectedStrokeStyle,
        isStartAnchorEnabled = this.isStartAnchorEnabled,
        userSelectedStartAnchor = this.userSelectedStartAnchor,
        isEndAnchorEnabled = this.isEndAnchorEnabled,
        userSelectedEndAnchor = this.userSelectedEndAnchor,
        dashPattern = this.dashPattern,
        isRoundedCorner = this.isRoundedCorner,
    }: Partial<LineExtra> = {}): LineExtra {
        return new LineExtra(
            isStrokeEnabled,
            userSelectedStrokeStyle,
            isStartAnchorEnabled,
            userSelectedStartAnchor,
            isEndAnchorEnabled,
            userSelectedEndAnchor,
            dashPattern,
            isRoundedCorner,
        );
    }
}

/**
 * A {@link ShapeExtra} for a rectangle box.
 */
export class RectangleExtra implements ShapeExtra, IRectangleExtra {
    constructor(
        public isFillEnabled: boolean,
        public userSelectedFillStyle: RectangleFillStyle,
        public isBorderEnabled: boolean,
        public userSelectedBorderStyle: StraightStrokeStyle,
        public dashPattern: StraightStrokeDashPattern,
        public corner: RectangleBorderCornerPattern,
    ) {
    }

    static create(extra: IRectangleExtra): RectangleExtra {
        return new RectangleExtra(
            extra.isFillEnabled,
            extra.userSelectedFillStyle,
            extra.isBorderEnabled,
            extra.userSelectedBorderStyle,
            extra.dashPattern,
            extra.corner,
        );
    }

    get isRoundedCorner(): boolean {
        return this.corner === RectangleBorderCornerPattern.ENABLED;
    }

    get fillStyle(): RectangleFillStyle | null {
        return this.isFillEnabled ? this.userSelectedFillStyle : null;
    }

    get strokeStyle(): StraightStrokeStyle | null {
        return this.isBorderEnabled
            ? PredefinedStraightStrokeStyle.getStyle(this.userSelectedBorderStyle.id, this.isRoundedCorner)
            : null;
    }

    equals(other: unknown): boolean {
        if (!(other instanceof RectangleExtra)) {
            return false;
        }
        return (
            this.isFillEnabled === other.isFillEnabled &&
            this.userSelectedFillStyle.id === other.userSelectedFillStyle.id &&
            this.isBorderEnabled === other.isBorderEnabled &&
            this.userSelectedBorderStyle.id === other.userSelectedBorderStyle.id &&
            this.dashPattern.toSerializableValue() === other.dashPattern.toSerializableValue() &&
            this.corner.toSerializableValue() === other.corner.toSerializableValue()
        );
    }

    copy({
        isFillEnabled = this.isFillEnabled,
        userSelectedFillStyle = this.userSelectedFillStyle,
        isBorderEnabled = this.isBorderEnabled,
        userSelectedBorderStyle = this.userSelectedBorderStyle,
        dashPattern = this.dashPattern,
        corner = this.corner,
    }: Partial<RectangleExtra> = {}): RectangleExtra {
        return new RectangleExtra(
            isFillEnabled,
            userSelectedFillStyle,
            isBorderEnabled,
            userSelectedBorderStyle,
            dashPattern,
            corner,
        );
    }
}

/**
 * A {@link ShapeExtra} for a text.
 */
export class TextExtra implements ShapeExtra {
    constructor(
        public boundExtra: RectangleExtra,
        public textAlign: TextAlign,
    ) {
    }

    hasBorder(): boolean {
        return this.boundExtra.isBorderEnabled;
    }

    equals(other: unknown): boolean {
        if (!(other instanceof TextExtra)) {
            return false;
        }
        return (
            this.boundExtra.equals(other.boundExtra) &&
            this.textAlign.equals(other.textAlign)
        );
    }

    copy({
        boundExtra = this.boundExtra,
        textAlign = this.textAlign,
    }: Partial<TextExtra> = {}): TextExtra {
        return new TextExtra(
            boundExtra.copy(),
            textAlign,
        );
    }

    static NO_BOUND: TextExtra = new TextExtra(
        RectangleExtra.create({
            ...ShapeExtraManager.defaultRectangleExtra,
            isFillEnabled: false,
            isBorderEnabled: false,
        }),
        new TextAlign(TextHorizontalAlign.LEFT, TextVerticalAlign.TOP),
    );

    static withDefault(): TextExtra {
        return new TextExtra(
            RectangleExtra.create(ShapeExtraManager.defaultRectangleExtra),
            ShapeExtraManager.defaultTextAlign,
        );
    }
}
