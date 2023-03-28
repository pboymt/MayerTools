<template>
    <div class="file-selector">
        <button @click="emit('new')">新建项目</button>
        <button @click="emit('load')">加载项目</button>
        <button @click="emit('save')">保存项目</button>
    </div>
</template>

<script setup lang="ts">
import { open } from '@tauri-apps/api/dialog';

const emit = defineEmits(['new', 'save', 'load']);

</script>

<style scoped lang="scss">
div.file-selector {
    height: 3rem;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    flex-grow: 0;
    flex-shrink: 0;

    border: {
        top: {
            style: solid;
            width: 1px;
            color: var(--border-color);
        }
    }
}
</style>