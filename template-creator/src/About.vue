<template>
    <div class="title-bar">
        <div class="title" data-tauri-drag-region>
            关于
        </div>
        <div class="actions">
            <div class="button" id="close-window" @click="hideWindow">
                ×
            </div>
        </div>
    </div>
    <div class="about-content">
        <div class="left-side">
            <img src="/src/assets/icon.png" alt="Vite Logo" />
        </div>
        <div class="right-side">
            <h2>{{ appName }} <span class="version">v{{ appVersion }}</span></h2>
            <p>操作系统：{{ osType }} {{ osVersion }}</p>
            <p>系统平台：{{ osPlatform }} {{ osArch }}</p>
            <p>Tauri版本：{{ tauriVersion }}</p>
            <p><a class="github" @click="openGithub"></a></p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { getCurrent, LogicalSize, PhysicalSize } from '@tauri-apps/api/window';
import * as os from '@tauri-apps/api/os';
import * as app from '@tauri-apps/api/app';
import { open } from '@tauri-apps/api/shell';
import { onMounted, ref } from 'vue';

const appName = ref('');
const appVersion = ref('');
const tauriVersion = ref('');
const osVersion = ref('');
const osArch = ref('');
const osPlatform = ref('');
const osType = ref('');

function hideWindow() {
    getCurrent().hide();
}

function openGithub() {
    open('https://github.com/pboymt/MayerTools')
}

onMounted(async () => {
    appName.value = await app.getName();
    appVersion.value = await app.getVersion();
    tauriVersion.value = await app.getTauriVersion();
    osVersion.value = await os.version();
    osArch.value = await os.arch();
    osPlatform.value = await os.platform();
    osType.value = await os.type();
});
</script>

<style scoped lang="scss"></style>