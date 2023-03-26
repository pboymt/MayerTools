<template>
    <div class="rect-list">
        <template v-if="rois">
            <RectItem v-for="roi in rois.values()" :key="roi.uuid" :roi="roi" :selected="selected!"
                @click="emit('select', roi.uuid)" />
        </template>
        <template v-else>
            <div class="nothing-alert">
                这里显示所有模板的列表
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { Rect, ROIs } from '@/dtos/ROI';
import RectItem from './RectItem.vue';
interface Props {
    rois?: ROIs;
    selected?: string;
}

const props = defineProps<Props>();
const emit = defineEmits(['select']);
</script>

<style scoped lang="scss">
div.rect-list {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    flex-grow: 1;
    flex-shrink: 1;

    border: {
        bottom: {
            width: 1px;
            style: solid;
            color: var(--border-color);
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