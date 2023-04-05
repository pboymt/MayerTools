<template>
    <div class="panel">
        <div class="background" ref="bgDiv"></div>
        <!-- <canvas ref="rBgCanvasElement" width="100" height="100"></canvas> -->
        <canvas ref="rCanvasElement" width="100" height="100"></canvas>
    </div>
</template>

<script setup lang="ts">
import { projectInjectKey } from "@/utils/injects";
import { inject, onBeforeUnmount, onMounted, ref, watch } from "vue";
import RendererWorker from '../core/renderer-worker?worker';

if (window.myWorker) {
    window.myWorker.terminate();
}
window.myWorker = new RendererWorker();

const project = inject(projectInjectKey);
const bgDiv = ref<HTMLDivElement>();
// const rBgCanvasElement = ref<HTMLCanvasElement>();
const rCanvasElement = ref<HTMLCanvasElement>();
let mCtx: CanvasRenderingContext2D | null = null;
let count = 0;

window.myWorker.addEventListener('message', (e) => {
    // console.log('message', e.data);
    const bitmap: ImageBitmap = e.data;
    mCtx?.clearRect(0, 0, rCanvasElement.value!.width, rCanvasElement.value!.height);
    mCtx?.drawImage(bitmap, 0, 0);
    bitmap.close();
    count++;
});



function initDrawable() {
    if (project?.value) {
        const { screenHeight: h, screenWidth: w } = project.value
        if (rCanvasElement.value) {
            rCanvasElement.value.width = w;
            rCanvasElement.value.height = h;
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
        window.myWorker?.postMessage({
            type: 'init',
            width: w,
            height: h,
            drawable: project.value.toDrawable()
        });
    }
}

watch(() => project?.value?.uuid, () => initDrawable());
watch(() => project?.value, (p) => {
    if (p) {
        window.myWorker?.postMessage({
            type: 'draw',
            drawable: p.toDrawable()
        });
    }
});

let intervalId: number | null = null;
onMounted(() => {
    mCtx = rCanvasElement.value!.getContext('2d')!;
    initDrawable();
    intervalId = window.setInterval(() => {
        if (project?.value) {
            window.myWorker?.postMessage({
                type: 'update',
                drawable: project.value.toDrawable()
            });
        }
    }, 20);
});

onBeforeUnmount(() => {
    window.myWorker?.terminate();
    clearInterval(intervalId!);
});
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