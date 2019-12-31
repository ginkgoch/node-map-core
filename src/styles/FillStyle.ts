import _ from "lodash";
import { Style } from "./Style";
import { StyleUtils } from "./StyleUtils";
import { JSONKnownTypes } from "../shared/JSONUtils";

/**
 * This class represents a style for an area based geometries (e.g. polygon, multi-polygon) only.
 */
export class FillStyle extends Style {
    fillStyle: string;
    lineWidth: number;
    strokeStyle: string;

    /**
     * Constructs a fill style instance.
     * @param {string} fillStyle The fill color string. 
     * @param {string} strokeStyle The stroke color string.
     * @param {number} lineWidth The stroke width in pixel.
     * @param {string} name The name of this style.
     */
    constructor(fillStyle?: string, strokeStyle?: string, lineWidth = 2, name?: string) {
        super();

        this.name = name || 'Fill Style';
        this.type = JSONKnownTypes.fillStyle;
        this.lineWidth = lineWidth;
        this.fillStyle = StyleUtils.colorOrRandomLight(fillStyle);
        this.strokeStyle = StyleUtils.colorOrRandomDark(strokeStyle);
    }

    /**
     * Collects the raw HTML style keys that will be included in the returning raw styles.
     * @override
     */
    protected _htmlStyleKeys(): string[] {
        return ['fillStyle', 'lineWidth', 'strokeStyle'];
    }
}