<template>
    <div class="panel">
        <canvas ref="rBgCanvasElement" width="100" height="100"></canvas>
        <canvas ref="rCanvasElement" width="100" height="100"></canvas>
    </div>
</template>
<script setup lang="ts">
import { CameraType } from "@/dtos/enums";
import { Bounds, Rect } from "@/dtos/ROI";
import { cameraTypeInjectKey, projectInjectKey } from "@/utils/injects";
import { inject, onBeforeUnmount, onMounted, ref, watch } from "vue";

const project = inject(projectInjectKey);
const camera  = inject(cameraTypeInjectKey);

const rBgCanvasElement = ref<HTMLCanvasElement>();
const rCanvasElement = ref<HTMLCanvasElement>();

let mAnimationFrameId: number | null = null;
let mCtx: CanvasRenderingContext2D | null = null;

watch(() => project, (project) => {
    if (project) {
        drawImageToCanvas();
    }
});

onMounted(() => {
    mCtx = rCanvasElement.value!.getContext('2d')!;
    mCtx.save();
    drawImageToCanvas();
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
    const bgCanvas = rBgCanvasElement.value;
    const canvas = rCanvasElement.value;
    if (bgCanvas && canvas) {
        // clear canvas
        const ctx = bgCanvas.getContext('2d')!;
        ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
        const { width, height } = img;
        bgCanvas.width = width;
        bgCanvas.height = height;
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0);
    }
}

/**
 * 刷新画布
 */
function refreshCanvas() {
    if (mCtx && project?.value?.image) {
        // mCtx.drawImage(props.project.image, 0, 0);
        mCtx.clearRect(0, 0, project.value.image.width, project.value.image!.height);
        drawSafeArea();
        drawSelectedRoiBorder();
        drawROIsRect();
    }
    requestAnimationFrame(refreshCanvas);
}

let safeAreaDashOffset = 0;

/**
 * 绘制安全区域，使用蚂蚁线
 */
function drawSafeArea() {
    if (mCtx && project?.value?.image) {
        const { x, y, width: w, height: h } = project.value.safeArea;
        mCtx.strokeStyle = 'green';
        mCtx.lineWidth = 4;
        mCtx.setLineDash([16, 16]);
        mCtx.lineDashOffset = -safeAreaDashOffset;
        mCtx.strokeRect(x, y, w, h);
        safeAreaDashOffset += 1;
        if (safeAreaDashOffset > 32) {
            safeAreaDashOffset = 0;
        }
    }
}

let selectedRectBorderDashOffset = 0;

/**
 * 绘制 ROI 中的 Rect
 */
function drawROIsRect() {
    if (mCtx && project?.value?.image) {
        const safeArea = project.value.safeArea;
        // mCtx.save();
        for (const roi of project.value.rois.values()) {
            const rect = roi.rect;
            const rectBounds = Bounds.fromRect(rect, roi, safeArea);
            mCtx.lineWidth = 2;
            mCtx.strokeStyle = 'blue';
            mCtx.setLineDash([]);
            mCtx.lineDashOffset = 0;
            // 是否选中
            const isSelected = roi.uuid === project.value.selectedRoiId;
            if (isSelected) { // 选中的绘制红色边框
                mCtx.lineWidth = 4;
                mCtx.strokeStyle = 'red';
            }
            // mCtx.strokeRect(roi.x + rect.x + safeArea.x, roi.y + rect.y + safeArea.y, rect.width, rect.height);
            mCtx.strokeRect(rectBounds.x, rectBounds.y, rectBounds.width, rectBounds.height);
            // 叠加虚线
            mCtx.strokeStyle = 'white';
            mCtx.setLineDash([5, 5]);
            if (camera?.value === CameraType.CAMERA_RECT && isSelected) {
                mCtx.lineDashOffset = -selectedRectBorderDashOffset;
                selectedRectBorderDashOffset++;
                if (selectedRectBorderDashOffset > 20) {
                    selectedRectBorderDashOffset = 0;
                }
            } else {
                mCtx.lineDashOffset = 0;
            }
            // mCtx.strokeRect(roi.x + rect.x + safeArea.x, roi.y + rect.y + safeArea.y, rect.width, rect.height);
            mCtx.strokeRect(rectBounds.x, rectBounds.y, rectBounds.width, rectBounds.height);
            // mCtx.restore();
        }
    }
}

let selectedRoiBorderDashOffset = 0;

/**
 * 绘制选中的 ROI 边框，使用蚂蚁线
 */
function drawSelectedRoiBorder() {
    if (mCtx && project?.value?.image) {
        const safeArea = project.value.safeArea;
        const roi = project.value.selectedROI;
        if (roi) {
            const rect = roi.rect;
            const roiBounds = Bounds.fromROI(roi, safeArea);
            mCtx.strokeStyle = 'red';
            mCtx.lineWidth = 2;
            mCtx.setLineDash([6, 6]);
            if (camera?.value === CameraType.CAMERA_ROI) {
                mCtx.lineDashOffset = -selectedRoiBorderDashOffset;
                selectedRoiBorderDashOffset++;
                if (selectedRoiBorderDashOffset > 24) {
                    selectedRoiBorderDashOffset = 0;
                }
            } else {
                mCtx.lineDashOffset = 0;
            }
            mCtx.strokeRect(roiBounds.x, roiBounds.y, roiBounds.width, roiBounds.height);
        }
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