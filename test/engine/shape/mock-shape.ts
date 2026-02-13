import type { Rect } from "../../../src/engine/geo/rect.ts";
import type { AbstractSerializableShape } from "../../../src/engine/shape/serialization.ts";
import { AbstractShape } from "../../../src/engine/shape/abstract-shape.ts";

/**
 * A simple shape for testing purpose
 */
export class MockShape extends AbstractShape {
    private boundInner: Rect;

    constructor(rect: Rect, parentId: string | null = null) {
        super(null, parentId);
        this.boundInner = rect;
    }

    toSerializableShape(_isIdIncluded: boolean): AbstractSerializableShape {
        throw new Error('Not yet implemented');
    }

    get bound(): Rect {
        return this.boundInner;
    }

    set bound(value: Rect) {
        this.update(() => {
            const isUpdated = this.boundInner !== value;
            this.boundInner = value;
            return isUpdated;
        });
    }
}
