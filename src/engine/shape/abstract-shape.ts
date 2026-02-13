import type { Comparable } from "../types/comparable.ts";
import type { Point } from "../geo/point.ts";
import type { Rect } from "../geo/rect.ts";
import type { Identifier } from "./identifier.ts";
import { NoExtra } from "../style/shape-extra.ts";
import type { ShapeExtra } from "../style/shape-extra.ts";
import type { AbstractSerializableShape } from "./serialization.ts";
import { UUID } from "../common/uuid.ts";

/**
 * An {@link Identifier} class for shape.
 * This is used for storing a reference to a shape without keeping the real reference to the
 * instance of the shape.
 */
export class ShapeIdentifier implements Identifier {
    constructor(public id: string) {
    }
}

/**
 * An abstract class which is used for defining all kinds of shape which are supported by the app.
 * Each shape will be assigned an id which is automatically generated or manually assigned. Two
 * shapes which have the same ID will be considered identical regardless the other attributes of
 * each kind of shape class.
 *
 * Each shape's attributes might be changed and {@link versionCode} reflects the update. To ensure the
 * versionCode's value is accurate, all properties modifying must be wrapped inside {@link update}.
 */
export abstract class AbstractShape extends ShapeIdentifier implements Comparable {
    parentId: string | null;
    versionCode: number;

    /**
     * Extra information which is specific to each shape.
     */
    protected extraInner: ShapeExtra = NoExtra;

    /**
     * @param id with null means the id will be automatically generated.
     * @param parentId the id of the parent shape. If the shape is a top-level shape, this value is
     * null.
     */
    protected constructor(id: string | null, parentId: string | null) {
        super(id ?? UUID.generate());
        this.parentId = parentId || null;
        this.versionCode = AbstractShape.nextVersionCode();
    }

    /**
     * A simple version of the shape's identifier although a shape is already a shape identifier.
     * This is used for the case that a shape is used as a key in a map.
     */
    get identifier(): ShapeIdentifier {
        return new ShapeIdentifier(this.id);
    }

    abstract toSerializableShape(isIdIncluded: boolean): AbstractSerializableShape;

    abstract get bound(): Rect;

    setBound(_newBound: Rect) {
        // Default implementation does nothing, can be overridden
    }

    /**
     * Set extra properties for the shape. Override this method if the shape supports extra properties.
     * @throws Error if the shape does not support extra properties.
     */
    setExtra(_newExtra: ShapeExtra) {
        throw new Error(`${this.constructor.name} does not support extra`);
    }

    get extra(): ShapeExtra {
        return this.extraInner;
    }

    /**
     * Updates properties of the shape by action. The action returns true if the shape's
     * properties are changed.
     */
    update(action: () => boolean) {
        const isChanged = action();
        if (isChanged) {
            this.versionCode = AbstractShape.nextVersionCode(this.versionCode);
        }
    }

    contains(point: Point): boolean {
        return this.bound.contains(point);
    }

    isVertex(point: Point): boolean {
        return this.bound.isVertex(point);
    }

    isOverlapped(rect: Rect): boolean {
        return this.bound.isOverlapped(rect);
    }

    /**
     * Returns true if the shape can have connectors.
     */
    get canHaveConnectors(): boolean {
        return false;
    }

    /**
     * Returns true if the shape is the same type to other and has the same id and version code.
     */
    equals(other: unknown): boolean {
        if (!(other instanceof AbstractShape)) {
            return false;
        }
        if (this.constructor !== other.constructor) {
            return false;
        }
        return this.id === other.id && this.versionCode === other.versionCode;
    }

    /**
     * Generates a new version code which is different from excludedValue.
     */
    static nextVersionCode(excludedValue: number = 0): number {
        let nextCode = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        // The probability of a new number is equal to old number is low, therefore, this loop
        // is short.
        while (nextCode === excludedValue) {
            nextCode = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        }
        return nextCode;
    }
}
