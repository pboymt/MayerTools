// As a Web Worker

import { DrawableBounds, DrawableProject, DrawableRect, DrawableROI } from "@/interfaces/Drawable";
import { CameraType } from "@/interfaces/enums";

interface IMessage {
    type: string;
}

interface MInit extends IMessage {
    type: 'init';
    width: number;
    height: number;
    drawable: DrawableProject;
}

interface MDraw extends IMessage {
    type: 'draw' | 'update';
    drawable: DrawableProject;
}

type MessageData = MInit | MDraw;

let canvas: OffscreenCanvas;
let ctx: OffscreenCanvasRenderingContext2D;

let drawing = false;
let drawable: DrawableProject;

addEventListener('message', (e) => {
    // console.log('Worker: Message received from main script');
    // console.log(e.data);
    const data: MessageData = e.data;
    if (data.type === 'update') {
        // console.log('Worker', 'update');
        drawable = data.drawable;
    } else if (data.type === 'draw') {
        // console.log('Worker', 'draw');
        drawable = data.drawable;
        if (!drawing) {
            drawing = true;
            draw();
        }
    } else if (data.type === 'init') {
        // console.log('Worker', 'init');
        init(data.width, data.height);
        drawable = data.drawable;
    }
});

function init(width: number, height: number) {
    if (canvas) {
        canvas.width = width;
        canvas.height = height;
    } else {
        canvas = new OffscreenCanvas(width, height);
        ctx = canvas.getContext('2d')! as OffscreenCanvasRenderingContext2D;
    }
    if (!drawing) {
        drawing = true;
        draw();
    }
}

function draw() {
    if (ctx && drawable) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawSafeArea(drawable.bounds);
        drawRectsWhite(drawable.rois);
        drawRectsDash(drawable.rois);
        postMessage(canvas.transferToImageBitmap());
    }
    if (drawing) requestAnimationFrame(draw);
}

let offsetSafeArea = 0;

/**
 * 绘制安全区域
 * @param area 
 */
function drawSafeArea(area: DrawableBounds) {
    ctx.save();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'green';
    ctx.setLineDash([16, 16]);
    ctx.lineDashOffset = -offsetSafeArea;
    ctx.strokeRect(area.x, area.y, area.width, area.height);
    ctx.restore();
    offsetSafeArea > 32 ? offsetSafeArea = 0 : offsetSafeArea += 1;
}

/**
 * 绘制各 ROI 中 Rect 的白色边框
 * @param rois 
 */
function drawRectsWhite(rois: DrawableROI[]) {
    ctx.save();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    rois.forEach(drawRectWhite);
    ctx.restore();
}

function drawRectWhite(roi: DrawableROI) {
    ctx.strokeRect(roi.rect.x, roi.rect.y, roi.rect.width, roi.rect.height);
}

/**
 * 绘制各 ROI 中 Rect 的虚线边框
 * @param rois 
 */
function drawRectsDash(rois: DrawableROI[]) {
    ctx.save();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'blue';
    ctx.setLineDash([5, 5]);
    rois.forEach(drawRectDash);
    ctx.restore();
}

let offsetRectDash = 0;

function drawRectDash(roi: DrawableROI) {
    if (roi.selected) {
        drawSelectedRectDash(roi);
        ctx.save();
        ctx.strokeStyle = 'red';
        if (drawable.cameraType === CameraType.CAMERA_RECT) {
            ctx.setLineDash([8, 8]);
            ctx.lineDashOffset = -offsetRectDash;
            offsetRectDash > 32 ? offsetRectDash = 0 : offsetRectDash += 1;
        }
    }
    ctx.strokeRect(roi.rect.x, roi.rect.y, roi.rect.width, roi.rect.height);
    if (roi.selected) {
        ctx.restore();
    }
}

let offsetRoiDash = 0;
/**
 * 绘制选中 ROI 的虚线边框
 */
function drawSelectedRectDash(roi: DrawableROI) {
    ctx.save();
    ctx.fillStyle = offsetRoiDash > 60 ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)';
    offsetRoiDash > 120 ? offsetRoiDash = 0 : offsetRoiDash += 2;
    ctx.fillRect(roi.x, roi.y, roi.width, roi.height);
    ctx.restore();
}

export type { IMessage };