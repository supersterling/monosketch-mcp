/**
 * A serializable class for extra properties of a rectangle shape.
 */
export class SerializableRectExtra {
    public isFillEnabled: boolean = false;
    public userSelectedFillStyleId: string = "";
    public isBorderEnabled: boolean = false;
    public userSelectedBorderStyleId: string = "";
    public dashPattern: string = "";
    public corner: string = "";

    private constructor() {
    }

    static create(
        {
            isFillEnabled,
            userSelectedFillStyleId,
            isBorderEnabled,
            userSelectedBorderStyleId,
            dashPattern,
            corner,
        }: {
            isFillEnabled: boolean;
            userSelectedFillStyleId: string;
            isBorderEnabled: boolean;
            userSelectedBorderStyleId: string;
            dashPattern: string;
            corner: string;
        },
    ): SerializableRectExtra {
        const result = new SerializableRectExtra();
        result.isFillEnabled = isFillEnabled;
        result.userSelectedFillStyleId = userSelectedFillStyleId;
        result.isBorderEnabled = isBorderEnabled;
        result.userSelectedBorderStyleId = userSelectedBorderStyleId;
        result.dashPattern = dashPattern;
        result.corner = corner;

        return result;
    }

    static EMPTY: SerializableRectExtra = new SerializableRectExtra();
}

/**
 * A serializable class for extra properties of a text shape.
 */
export class SerializableTextExtra {
    public boundExtra: SerializableRectExtra = SerializableRectExtra.EMPTY;
    public textHorizontalAlign: number = 0;
    public textVerticalAlign: number = 0;

    private constructor() {
    }

    static create(
        {
            boundExtra,
            textHorizontalAlign,
            textVerticalAlign,
        }: {
            boundExtra: SerializableRectExtra,
            textHorizontalAlign: number,
            textVerticalAlign: number,
        },
    ): SerializableTextExtra {
        const result = new SerializableTextExtra();
        result.boundExtra = boundExtra;
        result.textHorizontalAlign = textHorizontalAlign;
        result.textVerticalAlign = textVerticalAlign;

        return result;
    }

    static EMPTY: SerializableTextExtra = new SerializableTextExtra();
}

/**
 * A serializable class for extra properties of a line shape.
 */
export class SerializableLineExtra {
    public isStrokeEnabled: boolean = true;
    public userSelectedStrokeStyleId: string = "";
    public isStartAnchorEnabled: boolean = false;
    public userSelectedStartAnchorId: string = "";
    public isEndAnchorEnabled: boolean = false;
    public userSelectedEndAnchorId: string = "";
    public dashPattern: string = "";
    public isRoundedCorner: boolean = false;

    private constructor() {
    }

    static create(
        {
            isStrokeEnabled,
            userSelectedStrokeStyleId,
            isStartAnchorEnabled,
            userSelectedStartAnchorId,
            isEndAnchorEnabled,
            userSelectedEndAnchorId,
            dashPattern,
            isRoundedCorner,
        }: {
            isStrokeEnabled: boolean;
            userSelectedStrokeStyleId: string;
            isStartAnchorEnabled: boolean;
            userSelectedStartAnchorId: string;
            isEndAnchorEnabled: boolean;
            userSelectedEndAnchorId: string;
            dashPattern: string;
            isRoundedCorner: boolean;
        },
    ): SerializableLineExtra {
        const result = new SerializableLineExtra();
        result.isStrokeEnabled = isStrokeEnabled;
        result.userSelectedStrokeStyleId = userSelectedStrokeStyleId;
        result.isStartAnchorEnabled = isStartAnchorEnabled;
        result.userSelectedStartAnchorId = userSelectedStartAnchorId;
        result.isEndAnchorEnabled = isEndAnchorEnabled;
        result.userSelectedEndAnchorId = userSelectedEndAnchorId;
        result.dashPattern = dashPattern;
        result.isRoundedCorner = isRoundedCorner;

        return result;
    }

    static EMPTY: SerializableLineExtra = new SerializableLineExtra();
}
