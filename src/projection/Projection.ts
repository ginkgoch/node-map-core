import { ICoordinate, IEnvelope, Geometry, LinearRing, Polygon } from "ginkgoch-geom";
import proj4 from 'proj4';
import _ from "lodash";

export class Projection {
    _from?: string;
    _to?: string;
    _invalid = false;
    _converter?: proj4.Converter;

    constructor(from?: string, to?: string) {
        this._from = from;
        this._to = to;
    }

    //#region properties
    get from(): string | undefined {
        return this._from
    } 
    
    set from(fromProjection: string | undefined) {
        if (this._from !== fromProjection) {
            this._from = fromProjection
            this._invalid = true;
        }
    }

    get to(): string | undefined {
        return this._to
    } 
    
    set to(toProjection: string | undefined) {
        if (this._to !== toProjection) {
            this._to = toProjection
            this._invalid = true;
        }
    }
    //#endregion

    //#region forward
    forward(coordinate: ICoordinate): ICoordinate
    forward(coordinate: IEnvelope): IEnvelope
    forward(coordinate: Geometry): Geometry
    forward(geom: ICoordinate | IEnvelope | Geometry): ICoordinate | IEnvelope | Geometry {
        if (geom instanceof Geometry) {
            return this._forwardGeometry(geom);
        } else if (Projection._isInstanceOfICoordinate(geom)) {
            return this._forwardCoordinate(geom as ICoordinate);
        } else {
            return this._forwardEnvelope(geom as IEnvelope);
        }
    }

    private _forwardCoordinate(coordinate: ICoordinate) {
        return this._transform(coordinate, () => {
            return (<proj4.Converter>this._converter).forward(coordinate);
        });
    }

    private _forwardGeometry(geom: Geometry) {
        return geom.clone(c => {
            return this._forwardCoordinate(c);
        });
    }

    private _forwardEnvelope(envelope: IEnvelope) {
        const segmentCount = 4;
        const polygon = Projection._segmentEnvelope(envelope, segmentCount);
        const projectedPolygon = this._forwardGeometry(polygon);
        return projectedPolygon.envelope();
    }
    //#endregion

    //#region inverse
    inverse(coordinate: ICoordinate): ICoordinate
    inverse(coordinate: IEnvelope): IEnvelope
    inverse(coordinate: Geometry): Geometry
    inverse(geom: ICoordinate | IEnvelope | Geometry): ICoordinate | IEnvelope | Geometry {
        if (geom instanceof Geometry) {
            return this._inverseGeometry(geom);
        } else if (Projection._isInstanceOfICoordinate(geom)) {
            return this._inverseCoordinate(geom as ICoordinate);
        } else {
            return this._inverseEnvelope(geom as IEnvelope);
        }
    }

    private _inverseCoordinate(coordinate: ICoordinate) {
        return this._transform(coordinate, () => {
            return (<proj4.Converter>this._converter).inverse(coordinate);
        });
    }

    private _inverseGeometry(geom: Geometry) {
        return geom.clone(c => {
            return this._inverseCoordinate(c);
        });
    }

    private _inverseEnvelope(envelope: IEnvelope) {
        const segmentCount = 4;
        const polygon = Projection._segmentEnvelope(envelope, segmentCount);
        const projectedPolygon = this._inverseGeometry(polygon);
        return projectedPolygon.envelope();
    }
    //#endregion

    //#region private
    private _transform(coordinate: ICoordinate, project: () => ICoordinate): ICoordinate {
        if (this._from === undefined || this._to === undefined) {
            return coordinate;
        }

        if (this._converter === undefined || this._invalid) {
            this._converter = proj4(this._from, this._to);
        }

        return project();
    }

    private static _isInstanceOfICoordinate(obj: any) {
        return _.every(['x', 'y'], s => s in obj);
    }

    private static _segmentEnvelope(envelope: IEnvelope, segmentCount: number) {
        const distanceSegX = Math.abs(envelope.maxx - envelope.minx) / (segmentCount + 1);
        const distanceSegY = Math.abs(envelope.maxy - envelope.miny) / (segmentCount + 1);
        const coordinates = Array<ICoordinate>();
        for (let i = 0; i < segmentCount + 1; i++) {
            coordinates.push({ x: envelope.minx + i * distanceSegX, y: envelope.maxy });
        }

        for (let i = 0; i < segmentCount + 1; i++) {
            coordinates.push({ x: envelope.maxx, y: envelope.maxy - i * distanceSegY });
        }

        for (let i = 0; i < segmentCount + 1; i++) {
            coordinates.push({ x: envelope.maxx - i * distanceSegX, y: envelope.miny });
        }

        for (let i = 0; i < segmentCount + 1; i++) {
            coordinates.push({ x: envelope.minx, y: envelope.miny + i * distanceSegY });
        }

        coordinates.push({ x: envelope.minx, y: envelope.maxy });

        const polygon = new Polygon(new LinearRing(coordinates));
        return polygon;
    }
    //#endregion
}