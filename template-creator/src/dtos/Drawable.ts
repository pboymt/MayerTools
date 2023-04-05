import { CameraType, ScreenRatio } from "./enums";

interface DrawableProject {
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
    selected: boolean;
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
