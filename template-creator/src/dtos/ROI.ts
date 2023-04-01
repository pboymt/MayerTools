import { Project } from "./Project";

export interface IRect {
    uuid: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface IRegionOfInterest {
    uuid: string;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    anchor: Anchor;
    rect: IRect;
}

export enum Anchor {
    CENTER = 0,
    TOP_LEFT = 1,
    TOP_RIGHT = 2,
    BOTTOM_LEFT = 3,
    BOTTOM_RIGHT = 4,
    CENTER_LEFT = 5,
    CENTER_RIGHT = 6,
    CENTER_TOP = 7,
    CENTER_BOTTOM = 8,
}

export class RegionOfInterest implements IRegionOfInterest {

    rect: Rect;

    get bounds() {
        return Bounds.fromROI(this, this.parent.safeArea);
    }

    constructor(
        public parent: Project,
        public uuid: string = crypto.randomUUID(),
        public name: string = uuid,
        public x: number = 0,
        public y: number = 0,
        public width: number = 50,
        public height: number = 50,
        public anchor: Anchor = Anchor.TOP_LEFT,
        rect?: Rect
    ) {
        if (x < 0) this.x = 0;
        if (y < 0) this.y = 0;
        if (width < 1) this.width = 1;
        if (height < 1) this.height = 1;
        this.rect = rect ?? new Rect(parent, this);
    }

    /**
     * 移动 Rect 在 ROI 中的横向位置
     */
    moveRectX(offset: number) {
        // console.log('move rect x');
        if (this.rect.x + offset < 0) {
            this.rect.x = 0;
        } else if (this.rect.x + offset + this.rect.width > this.width) {
            this.rect.x = this.width - this.rect.width;
        } else {
            this.rect.x += offset;
        }
    }

    /**
     * 移动 Rect 在 ROI 中的纵向位置
     */
    moveRectY(offset: number) {
        // console.log('move rect y');
        if (this.rect.y + offset < 0) {
            this.rect.y = 0;
        } else if (this.rect.y + offset + this.rect.height > this.height) {
            this.rect.y = this.height - this.rect.height;
        } else {
            this.rect.y += offset;
        }
    }

    /**
     * 变化 Rect 在 ROI 中的宽度
     */
    changeRectWidth(offset: number) {
        // console.log('change rect width');
        if (this.rect.width + offset < 1) {
            this.rect.width = 1;
        } else if (this.rect.x + this.rect.width + offset > this.width) {
            this.rect.width = this.width - this.rect.x;
        } else {
            this.rect.width += offset;
        }
    }

    /**
     * 变化 Rect 在 ROI 中的高度
     */
    changeRectHeight(offset: number) {
        // console.log('change rect height');
        if (this.rect.height + offset < 1) {
            this.rect.height = 1;
        } else if (this.rect.y + this.rect.height + offset > this.height) {
            this.rect.height = this.height - this.rect.y;
        } else {
            this.rect.height += offset;
        }
    }

    /**
     * 将 ROI 转换为 JSON 对象
     * @returns JSON 对象
     */
    toJSON(): IRegionOfInterest {
        return {
            uuid: this.uuid,
            name: this.name,
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            anchor: this.anchor,
            rect: this.rect.toJSON(),
        }
    }

    /**
     * 克隆 ROI
     */
    clone() {
        const roi = new RegionOfInterest(this.parent, undefined, this.name, this.x, this.y, this.width, this.height, this.anchor);
        roi.rect = Rect.fromJSON(this.parent, roi, this.rect.toJSON())
        return roi;
    }

    /**
     * 从 JSON 对象创建 ROI
     * @param json JSON 对象
     * @returns ROI
     */
    static fromJSON(project: Project, json: IRegionOfInterest) {
        const roi = new RegionOfInterest(project, json.uuid, json.name, json.x, json.y, json.width, json.height, json.anchor);
        roi.rect = Rect.fromJSON(project, roi, json.rect);
        return roi;
    }

}

export class Rect implements IRect {
    uuid = crypto.randomUUID();

    get bounds() {
        return Bounds.fromRect(this, this.roi, this.proj.safeArea);
    }

    constructor(
        public proj: Project,
        public roi: RegionOfInterest,
        public x: number = 0,
        public y: number = 0,
        public width: number = 50,
        public height: number = 50
    ) { }

    /**
     * 将 Rect 转换为 JSON 对象
     * @returns JSON 对象
     */
    toJSON(): IRect {
        return {
            uuid: this.uuid,
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
        }
    }

    /**
     * 从 JSON 对象创建 Rect
     * @param json JSON 对象
     * @returns Rect
     */
    static fromJSON(project: Project, roi: RegionOfInterest, json: IRect) {
        const rect = new Rect(project, roi);
        rect.uuid = json.uuid;
        rect.x = json.x;
        rect.y = json.y;
        rect.width = json.width;
        rect.height = json.height;
        return rect;
    }

}

/**
 * 边界
 */
export class Bounds {

    constructor(
        public x: number,
        public y: number,
        public width: number,
        public height: number
    ) { }

    /**
     * 左边界
     */
    get left() { return this.x; }
    /**
     * 上边界
     */
    get top() { return this.y; }
    /**
     * 右边界
     */
    get right() { return this.x + this.width; }
    /**
     * 下边界
     */
    get bottom() { return this.y + this.height; }

    /**
     * ROI 根据传入的 SafeArea 计算出新的边界
     */
    static fromROI(roi: RegionOfInterest, safeArea: Bounds): Bounds {
        const { x, y, width, height } = roi;
        const { left, top } = safeArea;
        return new Bounds(left + x, top + y, width, height);
    }

    /**
     * Rect 根据传入的 SafeArea 和 ROI 计算出新的边界
     */
    static fromRect(rect: Rect, roi: RegionOfInterest, safeArea: Bounds): Bounds {
        const { x, y, width, height } = rect;
        const { left, top } = safeArea;
        const { x: roiX, y: roiY } = roi;
        return new Bounds(left + roiX + x, top + roiY + y, width, height);
    }

}

export type ROIs = Map<string, RegionOfInterest>;