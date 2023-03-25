<template>
    <div class="panel">
        <canvas ref="rCanvasElement" width="100" height="100"></canvas>
        <!-- <div class="image">
            <img :src="image" alt="请选择图片">
            <div class="safe-area"></div>
        </div> -->
    </div>
</template>
<script setup lang="ts">
import { Project } from "@/dtos/Project";
import { Rect, Rects } from "@/dtos/Rect";
import { ScreenRatio } from "@/dtos/ScreenRatio";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

interface Props {
    project: Project
}
const props = defineProps<Props>();

const rCanvasElement = ref<HTMLCanvasElement>();

let mAnimationFrameId: number | null = null;
let mCtx: CanvasRenderingContext2D | null = null;
let mImage: HTMLImageElement | null = null;

watch(props.project, (image) => {

});

onMounted(() => {
    mCtx = rCanvasElement.value?.getContext('2d')!;
    drawImageToCanvas(props.project);
    mAnimationFrameId = requestAnimationFrame(refreshCanvas);
});

onBeforeUnmount(() => {
    if (mAnimationFrameId != null) {
        cancelAnimationFrame(mAnimationFrameId);
    }
});

/**
 * 加载图片
 * @param url 图片 URL
 */
async function loadImage(url: string): Promise<HTMLImageElement> {
    const img = new Image();
    img.src = url;
    await img.decode();
    mImage = img;
    return img;
}

async function drawImageToCanvas(project: Project) {
    const img = project.image!;
    const canvas = rCanvasElement.value;
    if (canvas && mCtx) {
        // clear canvas
        mCtx.clearRect(0, 0, canvas.width, canvas.height);
        const { width, height } = img;
        canvas.width = width;
        canvas.height = height;
        mCtx.drawImage(img, 0, 0);
    }
}

/**
 * 刷新画布
 */
function refreshCanvas() {
    if (mCtx && props.project.image) {
        mCtx.drawImage(props.project.image, 0, 0);
        const safeArea = props.project.safeArea;
        drawSafeArea(safeArea.x, safeArea.y, safeArea.width, safeArea.height);
        for (const rect of props.project.rects.values()) {
            const isSelected = rect.uuid === props.project.selectedRectId;
            mCtx.strokeStyle = isSelected ? 'red' : 'blue';
            mCtx.lineWidth = isSelected ? 3 : 2;
            mCtx.strokeRect(rect.x + safeArea.x, rect.y + safeArea.y, rect.width, rect.height);
        }
    }
    requestAnimationFrame(refreshCanvas);
}

/**
 * 绘制安全区域
 */
function drawSafeArea(x: number, y: number, w: number, h: number) {
    if (mCtx && props.project.image) {
        mCtx.strokeStyle = 'green';
        mCtx.lineWidth = 2;
        mCtx.strokeRect(x, y, w, h);
    }
}

/**
 * 绘制危险区域，危险区域使用倾斜 45 度的半透明黄黑纹理填充
 */
function drawDangerArea() {
    if (mCtx && mImage) {
        const { width, height } = mImage;
        const rects = getDangerAreaRect(width, height, props.project.ratio);
        for (const rect of rects) {
            const { x, y, width: w, height: h } = rect;
            let pattern = document.createElement("canvas") as HTMLCanvasElement;
            pattern.width = 10;
            pattern.height = 10;
            let pctx = pattern.getContext("2d")!;
            pctx.fillStyle = "yellow";
            pctx.fillRect(0, 0, 5, 5);
            pctx.fillStyle = "black";
            pctx.fillRect(5, 5, 5, 5);
            pctx.globalAlpha = 0.5; // 设置半透明度
            let fillStyle = mCtx.createPattern(pattern, "repeat")!;

            // 绘制倾斜45度的变换矩阵
            mCtx.setTransform(1, -1 / Math.sqrt(2), 1 / Math.sqrt(2), 1, -x - y / Math.sqrt(2), x / Math.sqrt(2));

            // 绘制填充矩形
            mCtx.fillStyle = fillStyle;
            mCtx.fillRect(x + y / Math.sqrt(2), y - x / Math.sqrt(2), width * Math.sqrt(2), height * Math.sqrt(2));

            // 恢复默认变换矩阵
            mCtx.setTransform(1, 0, 0, 1, 0, 0);
        }
    }
}

/**
 * 计算危险区域
 */
function getDangerAreaRect(width: number, height: number, ratio: ScreenRatio) {
    const { x, y, width: w, height: h } = getSafeAreaRect(width, height, ratio);
    const x1 = x + w;
    const y1 = y + h;
    const x2 = x - w;
    const y2 = y - h;
    const x3 = x + w * 2;
    const y3 = y + h * 2;
    const x4 = x - w * 2;
    const y4 = y - h * 2;
    return [
        new Rect(x1, y1, x2, y2),
        new Rect(x1, y2, x2, y3),
        new Rect(x1, y3, x2, y4),
        new Rect(x2, y1, x3, y2),
        new Rect(x2, y2, x3, y3),
        new Rect(x2, y3, x3, y4),
        new Rect(x3, y1, x4, y2),
        new Rect(x3, y2, x4, y3),
        new Rect(x3, y3, x4, y4),
    ];
}

/**
 * 计算安全区域
 */
function getSafeAreaRect(width: number, height: number, ratio: ScreenRatio): Rect {
    let r = width / height;
    switch (ratio) {
        case ScreenRatio.RATIO_1_2:
            r = 1 / 2; break;
        case ScreenRatio.RATIO_3_4:
            r = 3 / 4; break;
        case ScreenRatio.RATIO_9_16:
            r = 9 / 16; break;
        default:
            break;
    }
    const w = Math.floor(r < 1 ? width : height * r);
    const h = Math.floor(r < 1 ? width / r : height);
    const x = Math.floor((width - w) / 2);
    const y = Math.floor((height - h) / 2);
    return new Rect(x, y, w, h);
}
</script>
<script lang="ts">
const defaultRects = [
    new Rect(0, 0, 100, 100)
]
</script>
<style scoped lang="scss">
div.panel {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;

    canvas {
        display: block;
        flex: none;
        max-width: 100%;
        max-height: 100%;
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