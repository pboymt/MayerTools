<template>
    <div class="panel">
        <div class="background" ref="bgDiv"></div>
        <!-- <canvas ref="rBgCanvasElement" width="100" height="100"></canvas> -->
        <canvas ref="rCanvasElement" width="100" height="100"></canvas>
    </div>
</template>
<script setup lang="ts">
import { DrawableBounds, DrawableProject, DrawableROI } from "@/interfaces/Drawable";
import { CameraType } from "@/interfaces/enums";
import { Bounds, Rect } from "@/interfaces/ROI";
import { cameraTypeInjectKey, projectInjectKey } from "@/utils/injects";
import { inject, onBeforeUnmount, onMounted, ref, watch } from "vue";

const project = inject(projectInjectKey);
// const camera = inject(cameraTypeInjectKey);

// const rBgCanvasElement = ref<HTMLCanvasElement>();
const bgDiv = ref<HTMLDivElement>();
const rCanvasElement = ref<HTMLCanvasElement>();

const offscreenCanvas = new OffscreenCanvas(100, 100);
const ctx = offscreenCanvas.getContext('2d')! as OffscreenCanvasRenderingContext2D;

let mAnimationFrameId: number | null = null;
let mCtx: CanvasRenderingContext2D | null = null;
const a: DrawableProject[] = [];

watch(() => project, (project) => {
    if (project) {
        initDrawable();
    }
});

onMounted(() => {
    mCtx = rCanvasElement.value!.getContext('2d')!;
    // ctx.save();
    initDrawable();
    mAnimationFrameId = requestAnimationFrame(refreshCanvas);
});

onBeforeUnmount(() => {
    if (mAnimationFrameId != null) {
        cancelAnimationFrame(mAnimationFrameId);
    }
});

async function drawImageToCanvas() {
    if (project?.value == null) return;
    const img = project.value.image!;
    // const bgCanvas = rBgCanvasElement.value;
    const canvas = rCanvasElement.value;
    // if (bgCanvas && canvas) {
    //     // clear canvas
    //     const ctx = bgCanvas.getContext('2d')!;
    //     ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    //     const { width, height } = img;
    //     bgCanvas.width = width;
    //     bgCanvas.height = height;
    //     canvas.width = width;
    //     canvas.height = height;
    //     ctx.drawImage(img, 0, 0);
    // }
}

function initDrawable() {
    if (project?.value) {
        const { screenHeight: h, screenWidth: w } = project.value
        if (rCanvasElement.value) {
            rCanvasElement.value.width = w;
            rCanvasElement.value.height = h;
        }
        if (offscreenCanvas) {
            offscreenCanvas.width = w;
            offscreenCanvas.height = h;
        }
        if (bgDiv.value) {
            bgDiv.value.style.aspectRatio = `${w}/${h}`
            if (w > h) {
                bgDiv.value.style.width = '100%';
                bgDiv.value.style.height = 'auto';
            } else {
                bgDiv.value.style.width = 'auto';
                bgDiv.value.style.height = '100%';
            }
            bgDiv.value.style.backgroundImage = `url(${project.value.image?.src})`;
        }
    }
}

/**
 * 刷新画布
 */
function refreshCanvas() {
    if (!ctx || !mCtx || !project?.value) return;
    if (ctx) {
        // mCtx.drawImage(props.project.image, 0, 0);
        ctx.clearRect(0, 0, project.value.screenWidth, project.value.screenHeight);
        const drawable = project.value.toDrawable();
        a[0] = drawable;
        drawSafeArea(drawable.bounds);
        drawROIsRect(drawable.rois);
        mCtx.clearRect(0, 0, project.value.screenWidth, project.value.screenHeight);
        mCtx.drawImage(offscreenCanvas, 0, 0);
        delete a[0];
    }
    mAnimationFrameId = requestAnimationFrame(refreshCanvas);
}

let safeAreaDashOffset = 0;

/**
 * 绘制安全区域，使用蚂蚁线
 */
function drawSafeArea(area: DrawableBounds) {
    if (ctx) {
        const { x, y, width: w, height: h } = area;
        ctx.save();
        ctx.strokeStyle = 'green';
        ctx.lineWidth = 4;
        ctx.setLineDash([16, 16]);
        ctx.lineDashOffset = -safeAreaDashOffset;
        ctx.strokeRect(x, y, w, h);
        safeAreaDashOffset += 1;
        if (safeAreaDashOffset > 32) {
            safeAreaDashOffset = 0;
        }
        ctx.restore();
    }
}

let selectedRectBorderDashOffset = 0;

/**
 * 绘制 ROI 中的 Rect
 */
function drawROIsRect(rois: DrawableROI[]) {
    if (ctx) {
        // const safeArea = project.value.safeArea;
        // mCtx.save();
        for (const roi of rois) {
            ctx.save();
            ctx.setLineDash([]);
            ctx.lineDashOffset = 0;
            // 是否选中
            if (roi.selected) { // 选中的绘制红色边框
                drawSelectedRoiBorder(roi);
                ctx.lineWidth = 4;
                ctx.strokeStyle = 'red';
            } else {
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'blue';
            }
            ctx.strokeRect(roi.rect.x, roi.rect.y, roi.rect.width, roi.rect.height);
            // 叠加虚线
            ctx.strokeStyle = 'white';
            ctx.setLineDash([5, 5]);
            if (project?.value?.cameraType === CameraType.CAMERA_RECT && roi.selected) {
                ctx.lineDashOffset = -selectedRectBorderDashOffset;
                selectedRectBorderDashOffset++;
                if (selectedRectBorderDashOffset > 20) {
                    selectedRectBorderDashOffset = 0;
                }
            } else {
                ctx.lineDashOffset = 0;
            }
            ctx.strokeRect(roi.rect.x, roi.rect.y, roi.rect.width, roi.rect.height);
            ctx.restore();
        }
    }
}

let selectedRoiBorderDashOffset = 0;

/**
 * 绘制选中的 ROI 边框，使用蚂蚁线
 */
function drawSelectedRoiBorder(roi: DrawableROI) {
    if (ctx) {
        ctx.save();
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        if (project?.value?.cameraType === CameraType.CAMERA_ROI) {
            ctx.lineDashOffset = -selectedRoiBorderDashOffset;
            selectedRoiBorderDashOffset++;
            if (selectedRoiBorderDashOffset > 24) {
                selectedRoiBorderDashOffset = 0;
            }
        } else {
            ctx.lineDashOffset = 0;
        }
        ctx.strokeRect(roi.x, roi.y, roi.width, roi.height);
        ctx.restore();
    }
}
</script>
<style scoped lang="scss">
div.panel {
    position: relative;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;

    canvas {
        position: absolute;
        display: block;
        flex: none;
        max-width: 100%;
        max-height: 100%;
        background-color: transparent;
    }

    div.background {
        position: absolute;
        display: block;
        flex: none;
        max-width: 100%;
        max-height: 100%;
        background-color: transparent;
        background-size: contain;
    }

    div.image {
        position: relative;

        img {
            max-width: 100%;
            max-height: 100%;
            margin-left: 1px;
        }

        div.safe-area {
            position: absolute;
            top: 50%;
            border: 1px solid red;
            width: 100%;
            margin-top: -50%;
            aspect-ratio: 9/16;
        }
    }

}
</style>