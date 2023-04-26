import { Anchor } from "@/interfaces/ROI";
import { CameraType, ScreenRatio } from "@/interfaces/enums";

interface DrawableProject {
    name: string;
    ratio: ScreenRatio;
    screenWidth: number;
    screenHeight: number;
    bounds: DrawableBounds;
    cameraType: CameraType;
    rois: DrawableROI[];
}

interface DrawableBounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface DrawableROI {
    name: string;
    selected: boolean;
    anchor: Anchor;
    x: number;
    y: number;
    width: number;
    height: number;
    // bounds: DrawableBounds;
    rect: DrawableRect;
}

interface DrawableRect {
    x: number;
    y: number;
    width: number;
    height: number;
    // bounds: DrawableBounds;
}

export type { DrawableProject, DrawableBounds, DrawableROI, DrawableRect };
