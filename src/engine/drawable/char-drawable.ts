import { MonoBitmap } from "../bitmap/monobitmap.ts";
import type { Drawable } from "./drawable.ts";

/**
 * A drawable which simplify fills with [char].
 */
export class CharDrawable implements Drawable {
    constructor(private readonly char: string) {
    }

    toBitmap(width: number, height: number): MonoBitmap.Bitmap {
        const builder = new MonoBitmap.Builder(width, height);
        builder.fillAll(this.char);
        return builder.toBitmap();
    }
}
