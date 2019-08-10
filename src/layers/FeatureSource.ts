import _ from "lodash";
import { IEnvelope, Feature, IFeature, Envelope } from "ginkgoch-geom";
import { Field } from "./Field";
import { Opener, Validator } from "../shared";
import { Projection } from "./Projection";
import { FieldFilterOptions } from "./FieldFilterOptions";

export abstract class FeatureSource extends Opener {
    name: string;
    projection: Projection

    constructor() {
        super();

        this.name = 'Unknown';
        this.projection = new Projection();
    }

    protected _open(): Promise<void> { 
        return Promise.resolve();
    }

    protected _close(): Promise<void> {
        return Promise.resolve();
    }

    async features(envelope?: IEnvelope, fields?: FieldFilterOptions): Promise<Feature[]> {
        Validator.checkOpened(this, !this._openRequired);

        let envelopeIn = envelope;
        if (envelopeIn !== undefined) {
            envelopeIn = this._inverseProjection(envelopeIn);
        } else {
            envelopeIn = { minx: Number.NEGATIVE_INFINITY, miny: Number.NEGATIVE_INFINITY, maxx: Number.POSITIVE_INFINITY, maxy: Number.POSITIVE_INFINITY };
        }

        const fieldsNorm = await this._normalizeFields(fields);
        const featuresIn = await this._features(envelopeIn, fieldsNorm);
        const featuresOut = this._forwardProjection(featuresIn);
        return featuresOut;
    }

    protected abstract async _features(envelope: IEnvelope, fields: string[]): Promise<Feature[]>;

    async feature(id: number, fields?: FieldFilterOptions): Promise<Feature | undefined> {
        let fieldsNorm = await this._normalizeFields(fields);
        let feature = await this._feature(id, fieldsNorm);
        if (feature === undefined) {
            return undefined;
        }

        feature = this._forwardProjection(feature);
        return feature;
    }

    protected abstract async _feature(id: number, fields: string[]): Promise<Feature | undefined>;

    protected async _normalizeFields(fields?: FieldFilterOptions): Promise<string[]> {
        if (fields === 'none') return [];

        const allFields = (await this.fields()).map(f => f.name);
        if (fields === 'all' || fields === undefined) {
            return allFields;
        } else {
            return _.intersection(allFields, fields);
        }
    }

    async count() {
        Validator.checkOpened(this, !this._openRequired);

        return (await this.features()).length;
    }

    async fields() {
        Validator.checkOpened(this, !this._openRequired);

        return await this._fields();
    }

    protected abstract async _fields(): Promise<Field[]>;

    async envelope() {
        Validator.checkOpened(this, !this._openRequired);

        let envelope = await this._envelope();
        return this.projection.forward(envelope);
    }

    protected abstract async _envelope(): Promise<Envelope>;

    get srs(): string | undefined {
        return this.projection.from;
    }

    set srs(srs: string|undefined) {
        this.projection.from = srs;
    }

    protected _inverseProjection(envelope: IEnvelope): IEnvelope;
    protected _inverseProjection(feature: IFeature): Feature;
    protected _inverseProjection(param: IEnvelope | IFeature): IEnvelope | Feature {
        if (this.isEnvelope(param)) {
            let envelope = param as IEnvelope;
            envelope = this.projection.inverse(envelope);
            return envelope;
        } else {
            let f = param as IFeature;
            let geometry = f.geometry.clone(c => this.projection.inverse(c));
            return new Feature(geometry, f.properties, f.id);
        }
    }

    protected _forwardProjection(feature: IFeature): Feature
    protected _forwardProjection(features: IFeature[]): Feature[]
    protected _forwardProjection(param: IFeature | IFeature[]): Feature | Feature[] {
        if (Array.isArray(param)) {
            let features = param as IFeature[];
            return features.map(f => {
                let geom = f.geometry.clone(c => this.projection.forward(c));
                return new Feature(geom, f.properties, f.id);
            });
        } else {
            let f = param as IFeature;
            let geom = f.geometry.clone(c => this.projection.inverse(c));
            return new Feature(geom, f.properties, f.id);
        }
    }

    //#region edit
    get editable() {
        return false;
    }

    async push(feature: IFeature) {
        Validator.checkOpenAndEditable(this, !this._openRequired);

        const featureIn = this._inverseProjection(feature);
        this._push(featureIn);
    }

    protected async _push(feature: IFeature) {
        this._notImplemented();
    }

    async update(feature: IFeature) {
        Validator.checkOpenAndEditable(this, !this._openRequired);

        const featureIn = this._inverseProjection(feature);
        await this._update(featureIn);
    }

    protected async _update(feature: IFeature) {
        this._notImplemented();
    }

    async remove(id: number) {
        Validator.checkOpenAndEditable(this, !this._openRequired);

        await this._remove(id);
    }

    protected async _remove(id: number) {
        this._notImplemented();
    }

    async pushField(field: Field) {
        Validator.checkOpenAndEditable(this, !this._openRequired);

        await this._pushField(field);
    }

    protected async _pushField(field: Field): Promise<void> {
        this._notImplemented();
    }

    async updateField(sourceFieldName: string, newField: Field) {
        Validator.checkOpenAndEditable(this, !this._openRequired);

        await this._updateField(sourceFieldName, newField);
    }

    protected async _updateField(sourceFieldName: string, newField: Field): Promise<void> {
        this._notImplemented();
    }

    async removeField(fieldName: string) {
        Validator.checkOpenAndEditable(this, !this._openRequired);

        await this._removeField(fieldName);
    }

    protected async _removeField(fieldName: string): Promise<void> {
        this._notImplemented();
    }

    private _notImplemented() {
        throw new Error('Not implemented');
    }
    //#endregion

    private isEnvelope(obj: any) {
        return ['minx', 'miny', 'maxx', 'maxy'].every(v => v in obj)
    }
}