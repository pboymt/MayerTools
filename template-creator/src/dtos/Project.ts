import { convertFileSrc } from "@tauri-apps/api/tauri";
import { nextTick } from "vue";
import { DrawableProject } from "./Drawable";
import { CameraType, ScreenRatio } from "./enums";
import { Bounds, IRegionOfInterest, RegionOfInterest, ROIs } from "./ROI";
import { Project as TProject, Project_RegionOfInterest, Project_ScreenRatio } from "./templates";

export interface IProject {
    /**
     * 项目文件格式的版本号
     */
    version: number;
    /**
     * 项目的唯一 id
     */
    uuid: string;
    /**
     * 项目的名称
     */
    name: string;
    /**
     * 屏幕安全区的长宽比，用于计算安全区域
     */
    ratio: ScreenRatio;
    /**
     * 屏幕的宽度
     */
    screenWidth: number;
    /**
     * 屏幕的高度
     */
    screenHeight: number;
    /**
     * 项目中的所有 ROI
     * @see RegionOfInterest
     */
    rois: IRegionOfInterest[];
    /**
     * 项目的背景图片的 base64 data url
     */
    dataURL: string;
}

/**
 * 工程对象
 */
export class Project implements Omit<IProject, 'rois'>{
    version: number = 1;
    uuid: string = crypto.randomUUID();
    name: string = `新项目 ${Date.now()}`;
    ratio: ScreenRatio = ScreenRatio.RATIO_FULL;
    screenWidth: number = 0;
    screenHeight: number = 0;
    rois: ROIs = new Map();
    dataURL: string = '';

    public cameraType: CameraType = CameraType.CAMERA_ROI;

    private _image: HTMLImageElement | null = null;
    /**
     * 项目的背景图片
     */
    get image() {
        return this._image;
    }

    private _selectedRoiId: string = '';
    /**
     * 当前选中的 ROI 的 id
     */
    get selectedRoiId(): string {
        return this._selectedRoiId.length === 0 ? this.rois.values().next().value?.uuid ?? '' : this._selectedRoiId;
    }
    set selectedRoiId(value: string) {
        this._selectedRoiId = value;
    }

    /**
     * 当前选中的 ROI
     */
    get selectedROI() {
        return this.rois.get(this.selectedRoiId);
    }

    /**
     * 计算所得的安全区域
     */
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
        return new Bounds(x, y, w, h);
    }

    constructor(public filename: string) { }

    /**
     * 加载背景图片
     * @param isDataURL 是否是 base64 data url
     */
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

    /********************** ROI 相关 **********************/

    /**
     * 添加一个新的 ROI
     */
    addROI() {
        // console.log('add roi');
        const roi = new RegionOfInterest(this);
        this.rois.set(roi.uuid, roi);
        this.selectedRoiId = roi.uuid;
        nextTick();
    }

    /**
     * 清空所有 ROI
     */
    clearROIs() {
        // console.log('clear rois');
        this.rois.clear();
        this.selectedRoiId = '';
        nextTick();
    }

    /**
     * 删除指定 id 的 ROI，如果不传 id 则删除当前选中的 ROI
     * @param id 要删除的 ROI 的 id，如果不传则删除当前选中的 ROI
     */
    removeROI(id?: string) {
        // console.log('remove roi');
        const willRemoveId = id ?? this.selectedRoiId;
        this.rois.delete(willRemoveId);
        if (this.selectedRoiId === willRemoveId) {
            this.selectedRoiId = this.rois.keys().next().value ?? '';
        }
        nextTick();
    }

    /**
     * 复制指定 uuid 的 ROI
     * @params uuid 要复制的 ROI 的 uuid
     */
    duplicateROI(uuid: string) {
        // console.log('duplicate roi');
        const roi = this.rois.get(uuid);
        if (roi) {
            const newRoi = roi.clone();
            this.rois.set(newRoi.uuid, newRoi);
            this.selectedRoiId = newRoi.uuid;
            nextTick();
        }
    }

    /**
     * 横向移动指定 id 的 ROI，如果不传 id 则移动当前选中的 ROI
     */
    moveRoiX(offset: number, id?: string) {
        // console.log('move roi x');
        if (offset === 0) return;
        const roi = this.selectedROI;
        // console.log(roi);
        if (roi) {
            const safeArea = this.safeArea;
            if (roi.x + offset < 0) {
                roi.x = 0;
            } else if (roi.x + roi.width + offset > safeArea.width) {
                roi.x = safeArea.width - roi.width;
            } else {
                roi.x += offset;
            }
            nextTick();
        }
    }

    /**
     * 纵向移动指定 id 的 ROI，如果不传 id 则移动当前选中的 ROI
     * @param id 要移动的 ROI 的 id，如果不传则移动当前选中的 ROI
     * @param offset 移动的量，正数为向下，负数为向上
     */
    moveRoiY(offset: number, id?: string) {
        // console.log('move roi y');
        if (offset === 0) return;
        const roi = this.selectedROI;
        // console.log(roi);
        if (roi) {
            const safeArea = this.safeArea;
            if (roi.y + offset < 0) {
                roi.y = 0;
            } else if (roi.y + roi.height + offset > safeArea.height) {
                roi.y = safeArea.height - roi.height;
            } else {
                roi.y += offset;
            }
            nextTick();
        }
    }

    /**
     * 变化指定 id 的 ROI 的宽度，如果不传 id 则变化当前选中的 ROI
     * @param id 要变化的 ROI 的 id，如果不传则变化当前选中的 ROI
     * @param variation 变化的量，正数为增加，负数为减少
     */
    changeRoiWidth(variation: number, id?: string) {
        // console.log('change roi width');
        if (variation === 0) return;
        const roi = this.selectedROI;
        // console.log(roi);
        if (roi) {
            const safeArea = this.safeArea;
            if (roi.bounds.right + variation > safeArea.right) {
                roi.width = safeArea.width - roi.bounds.left;
            } else if (roi.bounds.right + variation < roi.rect.bounds.right) {
                roi.width = roi.rect.bounds.right;
            } else {
                roi.width += variation;
            }
            nextTick();
        }
    }

    /**
     * 变化指定 id 的 ROI 的高度，如果不传 id 则变化当前选中的 ROI
     * @param id 要变化的 ROI 的 id，如果不传则变化当前选中的 ROI
     * @param variation 变化的量，正数为增加，负数为减少
     */
    changeRoiHeight(variation: number, id?: string) {
        // console.log('change roi height');
        if (variation === 0) return;
        const roi = this.selectedROI;
        // console.log(roi);
        if (roi) {
            const safeArea = this.safeArea;
            if (roi.y + roi.height + variation > safeArea.height) {
                roi.height = safeArea.height - roi.y;
            } else if (roi.y + roi.height + variation < roi.rect.width) {
                roi.height = roi.rect.width;
            } else {
                roi.height += variation;
            }
            nextTick();
        }
    }

    /********************** 数据转换相关 **********************/

    /**
     * 将背景图片转换为 base64 data url
     * @returns base64 data url
     */
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

    /**
     * 转换为 JSON 对象
     * @returns JSON 对象
     */
    toJSON(): IProject {
        return {
            version: this.version,
            uuid: this.uuid,
            name: this.name,
            ratio: this.ratio,
            screenWidth: this.screenWidth,
            screenHeight: this.screenHeight,
            rois: Array.from(this.rois.values()).map(r => r.toJSON()),
            dataURL: this.dataURL,
        };
    }

    /**
     * 从 JSON 对象创建 Project 对象
     * @param json JSON 对象
     * @returns Project 对象
     */
    static async fromJSON(json: IProject) {
        const project = new Project(json.dataURL);
        project.name = json.name;
        project.ratio = json.ratio;
        project.screenWidth = json.screenWidth;
        project.screenHeight = json.screenHeight;
        project.rois = new Map(json.rois.map((r: any) => [r.uuid, RegionOfInterest.fromJSON(project, r)]));
        return project;
    }

    /**
     * 转换为 Protobuf 二进制数据
     * @returns Protobuf 二进制数据
     */
    toProto() {
        return TProject.toBinary({
            version: this.version,
            uuid: this.uuid,
            name: this.name,
            ratio: this.ratio as unknown as Project_ScreenRatio,
            screenWidth: this.screenWidth,
            screenHeight: this.screenHeight,
            rois: Array.from(this.rois.values()).map(r => r.toJSON() as unknown as Project_RegionOfInterest),
            dataURL: this.dataURL,
        });
    }

    /**
     * 从 Protobuf 二进制数据创建 Project 对象
     * @param buffer Protobuf 二进制数据
     * @returns Project 对象
     */
    static async fromProto(buffer: Uint8Array) {
        const json = TProject.fromBinary(buffer);
        const project = new Project(json.dataURL);
        project.uuid = json.uuid;
        project.name = json.name;
        project.ratio = json.ratio as unknown as ScreenRatio;
        project.screenWidth = json.screenWidth;
        project.screenHeight = json.screenHeight;
        project.rois = new Map(json.rois.map((r: any) => [r.uuid, RegionOfInterest.fromJSON(project, r)]));
        console.log(project);
        return project;
    }

    /**
     * 提取绘制用的数据
     */
    toDrawable(): DrawableProject {
        return {
            ratio: this.ratio,
            screenWidth: this.screenWidth,
            screenHeight: this.screenHeight,
            rois: Array.from(this.rois.values()).map(r => r.toDrawable(r.uuid === this.selectedROI?.uuid)),
            bounds: this.safeArea.toDrawable(),
            cameraType: this.cameraType,
        };
    }

}