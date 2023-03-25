export interface IRect {
    uuid: string;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

export class Rect {
    uuid = crypto.randomUUID();
    name = '';
    x: number;
    y: number;
    width: number;
    height: number;

    constructor(x: number = 0, y: number = 0, width: number = 50, height: number = 50) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    toJSON(): IRect {
        return {
            uuid: this.uuid,
            name: this.name,
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
        }
    }

    static fromJSON(json: IRect) {
        const rect = new Rect();
        rect.uuid = json.uuid;
        rect.name = json.name;
        rect.x = json.x;
        rect.y = json.y;
        rect.width = json.width;
        rect.height = json.height;
        return rect;
    }
}

export type Rects = Map<string, Rect>;