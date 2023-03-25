import { IRect, Rect, Rects } from "./Rect";
import { ScreenRatio } from "./ScreenRatio";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import protobuf from "protobufjs";
import { Project as TProject, Project_ScreenRatio } from "./templates";

export interface IProject {
    uuid: string;
    name: string;
    ratio: ScreenRatio;
    screenWidth: number;
    screenHeight: number;
    rects: IRect[];
    dataURL: string;
}

export class Project {
    uuid: string = crypto.randomUUID();
    name: string = `新项目 ${Date.now()}`;
    ratio: ScreenRatio = ScreenRatio.RATIO_FULL;
    screenWidth: number = 0;
    screenHeight: number = 0;
    rects: Rects = new Map();
    dataURL: string = '';

    private _image: HTMLImageElement | null = null;
    get image() {
        return this._image;
    }

    private _selectedRectId?: string;
    get selectedRectId(): string {
        return this._selectedRectId ?? this.rects.keys().next().value ?? '';
    }
    set selectedRectId(value: string) {
        this._selectedRectId = value;
    }
    get selectedRect() {
        return this.rects.get(this.selectedRectId);
    }

    get safeArea() {
        let ratio = this.screenWidth / this.screenHeight;
        switch (this.ratio) {
            case ScreenRatio.RATIO_1_2:
                ratio = 1 / 2; break;
            case ScreenRatio.RATIO_3_4:
                ratio = 3 / 4; break;
            case ScreenRatio.RATIO_9_16:
                ratio = 9 / 16; break;
            default:
                break;
        }
        const w = Math.floor(ratio < 1 ? this.screenWidth : this.screenHeight * ratio);
        const h = Math.floor(ratio < 1 ? this.screenWidth / ratio : this.screenHeight);
        const x = Math.floor((this.screenWidth - w) / 2);
        const y = Math.floor((this.screenHeight - h) / 2);
        return new Rect(x, y, w, h);
    }

    constructor(public filename: string) {

    }

    async loadScreenImage(isDataURL = false) {
        const url = isDataURL ? this.filename : convertFileSrc(this.filename);
        const image = await new Promise<HTMLImageElement>(async (resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.src = url;
            await img.decode();
        });
        this.screenWidth = image.width;
        this.screenHeight = image.height;
        this._image = image;
        this.dataURL = this.imageToDataURL();
    }

    addRect() {
        const rect = new Rect();
        this.rects.set(rect.uuid, rect);
        this.selectedRectId = rect.uuid;
    }

    clearRects() {
        this.rects.clear();
    }

    removeRect(id?: string) {
        const willRemoveId = id ?? this.selectedRectId;
        this.rects.delete(willRemoveId);
    }

    private imageToDataURL() {
        const canvas = document.createElement('canvas');
        canvas.width = this.screenWidth;
        canvas.height = this.screenHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(this.image!, 0, 0);
        }
        return canvas.toDataURL();
    }

    toJSON(): IProject {
        return {
            uuid: this.uuid,
            name: this.name,
            ratio: this.ratio,
            screenWidth: this.screenWidth,
            screenHeight: this.screenHeight,
            rects: Array.from(this.rects.values()).map(r => r.toJSON()),
            dataURL: this.dataURL,
        };
    }

    static async fromJSON(json: IProject) {
        const project = new Project(json.dataURL);
        project.name = json.name;
        project.ratio = json.ratio;
        project.screenWidth = json.screenWidth;
        project.screenHeight = json.screenHeight;
        project.rects = new Map(json.rects.map((r: any) => [r.uuid, Rect.fromJSON(r)]));
        return project;
    }

    toProto() {
        return TProject.toBinary({
            uuid: this.uuid,
            name: this.name,
            ratio: this.ratio as unknown as Project_ScreenRatio,
            screenWidth: this.screenWidth,
            screenHeight: this.screenHeight,
            rects: Array.from(this.rects.values()).map(r => r.toJSON()),
            dataURL: this.dataURL,
        });
    }

    static async fromProto(buffer: Uint8Array) {
        const json = TProject.fromBinary(buffer);
        const project = new Project(json.dataURL);
        project.uuid = json.uuid;
        project.name = json.name;
        project.ratio = json.ratio as unknown as ScreenRatio;
        project.screenWidth = json.screenWidth;
        project.screenHeight = json.screenHeight;
        project.rects = new Map(json.rects.map((r: any) => [r.uuid, Rect.fromJSON(r)]));
        return project;
    }

}