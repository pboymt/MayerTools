<template>
    <div class="preview">
        <template v-if="project">
            <div class="rect-info">
                <ul>
                    <li>ROI-X: {{ project.selectedROI?.x }}</li>
                    <li>ROI-Y: {{ project.selectedROI?.y }}</li>
                    <li>ROI-W: {{ project.selectedROI?.width }}</li>
                    <li>ROI-H: {{ project.selectedROI?.height }}</li>
                    <li>REC-X: {{ project.selectedROI?.rect.x }}</li>
                    <li>REC-Y: {{ project.selectedROI?.rect.y }}</li>
                    <li>REC-W: {{ project.selectedROI?.rect.width }}</li>
                    <li>REC-H: {{ project.selectedROI?.rect.height }}</li>
                </ul>
            </div>
            <div class="rect-preview">
                <canvas v-if="project.selectedROI" ref="rCanvasElement"></canvas>
                <div v-else class="nothing-alert">
                    这是显示选中模板的预览图
                </div>
            </div>
        </template>
        <div v-else class="nothing-alert">
            没有打开的项目
        </div>
    </div>
</template>

<script setup lang="ts">
import { Bounds } from "@/dtos/ROI";
import { projectInjectKey } from "@/utils/injects";
import { inject, onBeforeUnmount, onMounted, ref } from "vue";

let mAnimationFrameId: number | null = null;
const project = inject(projectInjectKey);
const rCanvasElement = ref<HTMLCanvasElement>();

function drawSelectedRect() {
    cleanCanvas();
    if (project?.value) {
        const canvas = rCanvasElement.value;
        if (canvas) {
            const ctx = canvas.getContext('2d')!;
            const selectedROI = project.value.selectedROI;
            if (selectedROI) {
                const safeArea = project.value.safeArea;
                const rect = selectedROI.rect;
                const rectBounds = Bounds.fromRect(rect, selectedROI, safeArea);
                canvas.width = rectBounds.width;
                canvas.height = rectBounds.height;
                ctx.drawImage(project.value.image!, rectBounds.x, rectBounds.y, rectBounds.width, rectBounds.height, 0, 0, rectBounds.width, rectBounds.height);
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
    --preview-height: 12rem;
    position: relative;
    display: flex;
    flex-direction: row;
    height: var(--preview-height);
    background-color: var(--background-color);
    flex-grow: 0;
    flex-shrink: 0;
    align-items: stretch;
    justify-content: start;
    overflow: hidden;

    border: {
        top: {
            width: 1px;
            style: solid;
            color: var(--border-color);
        }
    }

    div.rect-info {
        display: flex;
        flex-direction: column;
        background-color: var(--background-color);
        flex: 1;

        border: {
            right: {
                width: 1px;
                style: solid;
                color: var(--border-color);
            }
        }

        ul{
            list-style-type: none;
            margin: 0;
            padding: 0;
            li{
                line-height: 1.5rem;
            }
        }
    }

    div.rect-preview {
        display: flex;
        align-items: center;
        justify-content: center;
        width: var(--preview-height);

        canvas {
            max-width: 80%;
            max-height: 80%;
            background-color: transparent;
        }
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