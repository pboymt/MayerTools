<template>
    <div class="preview">
        <canvas v-if="props.project.selectedRect" ref="rCanvasElement"></canvas>
        <div v-else class="nothing-alert">
            这是显示选中模板的预览图
        </div>
    </div>
</template>

<script setup lang="ts">
import { Project } from "@/dtos/Project";
import { onMounted, ref } from "vue";

interface Props {
    project: Project;
}

const props = defineProps<Props>();
const rCanvasElement = ref<HTMLCanvasElement>();

function drawSelectedRect() {
    cleanCanvas();
    const canvas = rCanvasElement.value;
    if (canvas) {
        const ctx = canvas.getContext('2d')!;
        const selectedRect = props.project.selectedRect;
        if (selectedRect) {
            const safeArea = props.project.safeArea;
            const { x, y, width, height } = selectedRect;
            const { x: sx, y: sy } = safeArea;
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(props.project.image!, sx + x, sy + y, width, height, 0, 0, width, height);
        }
    }
    requestAnimationFrame(drawSelectedRect);
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
</script>

<style scoped lang="scss">
div.preview {
    position: relative;
    display: flex;
    flex-direction: column;
    aspect-ratio: 3/2;
    background-color: var(--background-color);
    flex-grow: 0;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    canvas {
        max-width: 80%;
        max-height: 80%;
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