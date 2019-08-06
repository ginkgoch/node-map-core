import { TextStyle } from "../../src/styles/TextStyle";
import { Feature, Point, LineString } from "ginkgoch-geom";
import { Render } from "../../src/render";
import TestUtils from "../shared/TestUtils";
import { LineStyle } from "../../src/styles";

const compareImage = TestUtils.compareImageFunc(TestUtils.resolveStyleDataPath);

describe('TextStyle', () => {
    it('_extractFields - 1', () => {
        let style: any;
        style = new TextStyle('abc');
        let fields = style._extractFields();
        expect(fields).toEqual([]);
    });

    it('_extractFields - 2', () => {
        let style: any;
        style = new TextStyle('[abc] + [def]');
        let fields = style._extractFields();
        expect(fields).toEqual(['abc', 'def']);
    });

    it('_formattedContent', () => {
        let style: any;
        style = new TextStyle('[abc] + [def]');
        const map = new Map<string, any>([['abc', 'Hello'], ['def', 'World']]);
        const result = style._formatContent(map);
        expect(result).toEqual('Hello + World');
    });

    it('draw - 1', () => {
        const style = new TextStyle('Hello World', '#ff0000');
        
        const canvas = Render.create(128, 128);
        const feature = new Feature(new Point(0, 0));
        style.draw(feature, canvas);
        canvas.flush();

        compareImage(canvas.image, 'text-1.png');
    });

    it('draw - 2', () => {
        const style = new TextStyle('Hello World', 'green', '20px ARIAL');
        
        const canvas = Render.create(128, 128);
        const feature = new Feature(new Point(0, 0));
        style.draw(feature, canvas);
        canvas.flush();

        compareImage(canvas.image, 'text-2.png');
    });

    it('draw - 3', () => {
        const style = new TextStyle('Hello World', '#ff0000');
        style.textAlign = 'left';
        
        const canvas = Render.create(128, 128);
        const feature = new Feature(new Point(0, 0));
        style.draw(feature, canvas);
        canvas.flush();

        compareImage(canvas.image, 'text-3.png');
    });

    it('draw - 4', () => {
        const textStyle = new TextStyle('Hello World', '#ff0000');
        const lineStyle = new LineStyle('green', 1);
        
        const canvas = Render.create(128, 128);
        const coordinates = [[-170, -80], [170, 80]].map(c => ({x: c[0], y: c[1]}));
        const feature = new Feature(new LineString(coordinates));
        lineStyle.draw(feature, canvas);
        textStyle.draw(feature, canvas);
        canvas.flush();

        compareImage(canvas.image, 'text-4.png', true);
    });
});