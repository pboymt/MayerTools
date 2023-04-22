<template>
    <div class="window">
        <!-- <div>
            {{ output }}
        </div> -->
        <img v-if="dataURL" :src="dataURL" alt="">
    </div>
</template>

<script setup lang="ts">
import { listen } from '@tauri-apps/api/event';
import { WebviewWindow } from '@tauri-apps/api/window';
import { onMounted, ref } from 'vue';

const output = ref('');
const dataURL = ref<string>();

interface ExportInitedPayload {
    dataURL: string;
}



onMounted(() => {
    listen<ExportInitedPayload>('export-load', (e) => {
        console.log(e.payload.dataURL);
        output.value = e.payload.dataURL;
        dataURL.value = e.payload.dataURL;
    });
    WebviewWindow.getByLabel('main')?.emit('export-inited');
});
</script>

<style scoped lang="scss">
div.window {
    display: flex;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    justify-content: center;
    align-items: center;

    img {
        max-width: 98%;
        max-height: 98%;
    }
}
</style>