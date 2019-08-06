import { PointStyle } from "../../src/styles";
import { Point, Feature } from "ginkgoch-geom";
import { Render } from "../../src/render";
import TestUtils from "../shared/TestUtils";

const compareImage = TestUtils.compareImageFunc(TestUtils.resolveStyleDataPath);

describe('PointStyle', () => {
    it('default', () => {
        const style = new PointStyle('#ffffff', 'yellow', 6, 20, 'default');
        const canvas = Render.create(64, 64);
        style.draw(new Feature(new Point(0, 0)), canvas);
        canvas.flush();

        compareImage(canvas.image, 'point-default.png');
    });

    it('circle', () => {
        const style = new PointStyle('#ffffff', 'yellow', 6, 20, "circle");
        const canvas = Render.create(64, 64);
        style.draw(new Feature(new Point(0, 0)), canvas);
        canvas.flush();

        compareImage(canvas.image, 'point-circle.png');
    });
    
    it('square', () => {
        const style = new PointStyle('red', 'yellow', 6, 20, "square");
        const canvas = Render.create(64, 64);
        style.draw(new Feature(new Point(0, 0)), canvas);
        canvas.flush();

        compareImage(canvas.image, 'point-square.png');
    });
    
    it('rect', () => {
        const style = new PointStyle('green', 'yellow', 6, 20, "rect");
        const canvas = Render.create(64, 64);
        style.draw(new Feature(new Point(0, 0)), canvas);
        canvas.flush();

        compareImage(canvas.image, 'point-rect.png');
    });
});