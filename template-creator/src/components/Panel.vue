<template>
    <div class="panel">
        <canvas ref="rBgCanvasElement" width="100" height="100"></canvas>
        <canvas ref="rCanvasElement" width="100" height="100"></canvas>
        <!-- <div class="image">
            <img :src="image" alt="请选择图片">
            <div class="safe-area"></div>
        </div> -->
    </div>
</template>
<script setup lang="ts">
import { Project } from "@/dtos/Project";
import { Bounds, Rect, ROIs } from "@/dtos/ROI";
import { ScreenRatio } from "@/dtos/ScreenRatio";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

interface Props {
    project: Project
}
const props = defineProps<Props>();

const rBgCanvasElement = ref<HTMLCanvasElement>();
const rCanvasElement = ref<HTMLCanvasElement>();

let mAnimationFrameId: number | null = null;
let mCtx: CanvasRenderingContext2D | null = null;

watch(() => props.project, (project) => {
    if (project) {
        drawImageToCanvas(project);
    }
});

onMounted(() => {
    mCtx = rCanvasElement.value!.getContext('2d')!;
    mCtx.save();
    drawImageToCanvas(props.project);
    mAnimationFrameId = requestAnimationFrame(refreshCanvas);
});

onBeforeUnmount(() => {
    if (mAnimationFrameId != null) {
        cancelAnimationFrame(mAnimationFrameId);
    }
});

async function drawImageToCanvas(project: Project) {
    const img = project.image!;
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
    if (mCtx && props.project.image) {
        // mCtx.drawImage(props.project.image, 0, 0);
        mCtx.clearRect(0, 0, props.project.image!.width, props.project.image!.height);
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
    if (mCtx && props.project.image) {
        const { x, y, width: w, height: h } = props.project.safeArea;
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

/**
 * 绘制 ROI 中的 Rect
 */
function drawROIsRect() {
    if (mCtx && props.project.image) {
        const safeArea = props.project.safeArea;
        // mCtx.save();
        for (const roi of props.project.rois.values()) {
            const rect = roi.rect;
            const rectBounds = Bounds.fromRect(rect, roi, safeArea);
            mCtx.lineWidth = 2;
            mCtx.strokeStyle = 'blue';
            mCtx.setLineDash([]);
            mCtx.lineDashOffset = 0;
            // 是否选中
            const isSelected = roi.uuid === props.project.selectedRoiId;
            if (isSelected) { // 选中的绘制红色边框
                mCtx.lineWidth = 4;
                mCtx.strokeStyle = 'red';
            }
            // mCtx.strokeRect(roi.x + rect.x + safeArea.x, roi.y + rect.y + safeArea.y, rect.width, rect.height);
            mCtx.strokeRect(rectBounds.x, rectBounds.y, rectBounds.width, rectBounds.height);
            // 叠加虚线
            mCtx.strokeStyle = 'white';
            mCtx.setLineDash([5, 5]);
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
    if (mCtx && props.project.image) {
        const safeArea = props.project.safeArea;
        const roi = props.project.selectedROI;
        if (roi) {
            const rect = roi.rect;
            const roiBounds = Bounds.fromROI(roi, safeArea);
            mCtx.strokeStyle = 'red';
            mCtx.lineWidth = 2;
            mCtx.setLineDash([6, 6]);
            mCtx.lineDashOffset = -selectedRoiBorderDashOffset;
            // mCtx.strokeRect(roi.x + rect.x + safeArea.x, roi.y + rect.y + safeArea.y, rect.width, rect.height);
            mCtx.strokeRect(roiBounds.x, roiBounds.y, roiBounds.width, roiBounds.height);
            selectedRoiBorderDashOffset++;
            if (selectedRoiBorderDashOffset > 24) {
                selectedRoiBorderDashOffset = 0;
            }
        }
    }
}
</script>
<script lang="ts">
const defaultRects = [
    new Rect(0, 0, 100, 100)
]
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