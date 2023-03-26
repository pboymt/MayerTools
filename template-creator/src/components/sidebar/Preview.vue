<template>
    <div class="preview">
        <template v-if="project">
            <canvas v-if="project.selectedROI" ref="rCanvasElement"></canvas>
            <div v-else class="nothing-alert">
                这是显示选中模板的预览图
            </div>
        </template>
        <div v-else class="nothing-alert">
            没有打开的项目
        </div>
    </div>
</template>

<script setup lang="ts">
import { Project } from "@/dtos/Project";
import { Bounds } from "@/dtos/ROI";
import { onBeforeUnmount, onMounted, ref } from "vue";

interface Props {
    project?: Project;
}

let mAnimationFrameId: number | null = null;
const props = defineProps<Props>();
const rCanvasElement = ref<HTMLCanvasElement>();

function drawSelectedRect() {
    cleanCanvas();
    if (props.project) {
        const canvas = rCanvasElement.value;
        if (canvas) {
            const ctx = canvas.getContext('2d')!;
            const selectedROI = props.project.selectedROI;
            if (selectedROI) {
                const safeArea = props.project.safeArea;
                const rect = selectedROI.rect;
                const rectBounds = Bounds.fromRect(rect, selectedROI, safeArea);
                canvas.width = rectBounds.width;
                canvas.height = rectBounds.height;
                ctx.drawImage(props.project.image!, rectBounds.x, rectBounds.y, rectBounds.width, rectBounds.height, 0, 0, rectBounds.width, rectBounds.height);
            }
        }
    }
    mAnimationFrameId = requestAnimationFrame(drawSelectedRect);
}

function cleanCanvas() {
    const canvas = rCanvasElement.value;
    if (canvas) {
        const ctx = canvas.getContext('2d')!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

onMounted(() => {
    drawSelectedRect();
});

onBeforeUnmount(() => {
    if (mAnimationFrameId != null) {
        cancelAnimationFrame(mAnimationFrameId);
    }
});
</script>

<style scoped lang="scss">
div.preview {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    aspect-ratio: 3/2;
    background-color: var(--background-color);
    flex-grow: 0;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    border: {
        top: {
            width: 1px;
            style: solid;
            color: var(--border-color);
        }
    }

    canvas {
        max-width: 80%;
        max-height: 80%;
        background-color: transparent;
    }

    div.nothing-alert {
        user-select: none;
        height: 3rem;
        line-height: 3rem;
        text-align: center;
        color: var(--text-color);
    }
}
</style>