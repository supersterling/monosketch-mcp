import { type DirectedPoint, Point } from "../geo/point.ts";
import type { Rect } from "../geo/rect.ts";
import {
    SerializableLineExtra,
    SerializableRectExtra,
    SerializableTextExtra,
} from "./serialization-extras.ts";

/**
 * An abstract class for all serializable shapes.
 */
export abstract class AbstractSerializableShape {
    /**
     * The id of this shape.
     * If this is null, the shape does not have id and will be assigned a new id when created.
     */
    abstract id: string | null;

    /**
     * A flag indicates that, if this value is true, even if the id is not null, the id is still
     * unavailable. This is similar to when id is null but the temporary id is used for function
     * like copy-paste.
     */
    abstract isIdTemporary: boolean;

    abstract versionCode: number;

    /**
     * A hint for type selection when serializing and deserializing.
     */
    abstract type: string;

    /**
     * The id of this shape after adjusting the isIdTemporary flag.
     */
    get actualId(): string | null {
        return !this.isIdTemporary ? (this.id ?? null) : null;
    }

    protected constructor() {
    }
}

/**
 * A serializable class for a rectangle shape.
 */
export class SerializableRectangle extends AbstractSerializableShape {
    public type: string = "R";
    public id: string | null = null;
    public isIdTemporary: boolean = false;
    public versionCode: number = 0;
    public bound: Rect = undefined!; // Set via create()
    public extra: SerializableRectExtra = SerializableRectExtra.EMPTY;

    private constructor() {
        super();
    }

    static EMPTY: SerializableRectangle = new SerializableRectangle();

    static create(
        {
            id,
            isIdTemporary,
            versionCode,
            bound,
            extra,
        }: {
            id: string | null;
            isIdTemporary: boolean;
            versionCode: number;
            bound: Rect;
            extra: SerializableRectExtra;
        },
    ): SerializableRectangle {
        const result = new SerializableRectangle();
        result.id = id;
        result.isIdTemporary = isIdTemporary;
        result.versionCode = versionCode;
        result.bound = bound;
        result.extra = extra;

        return result;
    }
}

/**
 * A serializable class for a text shape.
 */
export class SerializableText extends AbstractSerializableShape {
    public type: string = "T";
    public id: string | null = null;
    public isIdTemporary: boolean = false;
    public versionCode: number = 0;
    public bound: Rect = undefined!; // Set via create()
    public text: string = "";
    public extra: SerializableTextExtra = SerializableTextExtra.EMPTY;
    public isTextEditable: boolean = false;

    private constructor() {
        super();
    }

    static create(
        {
            id,
            isIdTemporary,
            versionCode,
            bound,
            text,
            extra,
            isTextEditable,
        }: {
            id: string | null;
            isIdTemporary: boolean;
            versionCode: number;
            bound: Rect;
            text: string;
            extra: SerializableTextExtra;
            isTextEditable: boolean;
        },
    ): SerializableText {
        const result = new SerializableText();
        result.id = id;
        result.isIdTemporary = isIdTemporary;
        result.versionCode = versionCode;
        result.bound = bound;
        result.text = text;
        result.extra = extra;
        result.isTextEditable = isTextEditable;

        return result;
    }
}


/**
 * A serializable class for a line shape.
 */
export class SerializableLine extends AbstractSerializableShape {
    public type: string = "L";
    public id: string | null = null;
    public isIdTemporary: boolean = false;
    public versionCode: number = 0;
    public startPoint: DirectedPoint = undefined!; // Set via create()
    public endPoint: DirectedPoint = undefined!; // Set via create()
    public jointPoints: Point[] = [];
    public extra: SerializableLineExtra = SerializableLineExtra.EMPTY;
    public wasMovingEdge: boolean = true;

    private constructor() {
        super();
    }

    static create(
        {
            id,
            isIdTemporary,
            versionCode,
            startPoint,
            endPoint,
            jointPoints,
            extra,
            wasMovingEdge,
        }: {
            id: string | null;
            isIdTemporary: boolean;
            versionCode: number;
            startPoint: DirectedPoint;
            endPoint: DirectedPoint;
            jointPoints: Point[];
            extra: SerializableLineExtra;
            wasMovingEdge: boolean;
        },
    ): SerializableLine {
        const result = new SerializableLine();
        result.id = id;
        result.isIdTemporary = isIdTemporary;
        result.versionCode = versionCode;
        result.startPoint = startPoint;
        result.endPoint = endPoint;
        result.jointPoints = jointPoints;
        result.extra = extra;
        result.wasMovingEdge = wasMovingEdge;

        return result;
    }
}

/**
 * A serializable class for a group shape.
 */
export class SerializableGroup extends AbstractSerializableShape {
    public type: string = "G";
    public id: string | null = null;
    public isIdTemporary: boolean = false;
    public versionCode: number = 0;
    public shapes: AbstractSerializableShape[] = [];

    private constructor() {
        super();
    }

    copy({ isIdTemporary = this.isIdTemporary }: { isIdTemporary: boolean }): SerializableGroup {
        return SerializableGroup.create({
            id: this.id,
            isIdTemporary,
            versionCode: this.versionCode,
            shapes: this.shapes,
        });
    }

    static EMPTY: SerializableGroup = new SerializableGroup();

    static create(
        {
            id,
            isIdTemporary,
            versionCode,
            shapes,
        }: {
            id: string | null;
            isIdTemporary: boolean;
            versionCode: number;
            shapes: AbstractSerializableShape[];
        },
    ): SerializableGroup {
        const result = new SerializableGroup();
        result.id = id;
        result.isIdTemporary = isIdTemporary;
        result.versionCode = versionCode;
        result.shapes = shapes;

        return result;
    }
}
