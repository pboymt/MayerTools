<template>
    <div class="rect-item">
        <div class="radio">
            <span v-if="roi.uuid === selected" class="material-symbols-outlined">
                radio_button_checked </span>
            <span v-else class="material-symbols-outlined"> radio_button_unchecked </span>
        </div>
        <div class="name" :title="roi.name">{{ roi.name }}</div>
        <div class="actions">
            <div class="action" @click="rename" title="重命名">
                <span class="material-symbols-outlined">
                    edit_square
                </span>
            </div>
            <div class="action" @click="duplicate" title="复制">
                <span class="material-symbols-outlined">
                    content_copy
                </span>
            </div>
            <div class="action" @click="remove" title="删除">
                <span class="material-symbols-outlined">
                    delete
                </span>
            </div>
        </div>
        <!-- <div class="value">{{ roi.x }}</div>
        <div class="value">{{ roi.y }}</div>
        <div class="value">{{ roi.width }}</div>
        <div class="value">{{ roi.height }}</div> -->
    </div>
</template>

<script setup lang="ts">
import { Rect, RegionOfInterest } from '@/dtos/ROI';

interface Props {
    roi: RegionOfInterest;
    selected: string;
}

const props = defineProps<Props>();
const emit = defineEmits(['rename', 'duplicate', 'remove']);

function rename($event: MouseEvent) {
    $event.stopPropagation();
    emit('rename');
}

function duplicate($event: MouseEvent) {
    $event.stopPropagation();
    emit('duplicate');
}

function remove($event: MouseEvent) {
    $event.stopPropagation();
    emit('remove');
}
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

div.rect-item {
    display: flex;
    flex-direction: row;
    height: 2rem;
    line-height: 2rem;
    overflow: hidden;
    cursor: pointer;
    user-select: none;

    &:hover {
        background-color: var(--hover-mask-color);
    }

    &:active {
        background-color: var(--active-mask-color);
    }

    border: {
        bottom: {
            style: solid;
            width: 1px;
            color: var(--border-color);
        }
    }

    div.radio {
        display: flex;
        height: 100%;
        aspect-ratio: 1/1;
        align-items: center;
        justify-content: center;

        span {
            font-size: 1rem;
        }
    }

    div.name {
        flex: 1 0 2rem;
        text-align: start;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
    }

    div.actions {
        display: flex;
        align-items: stretch;
        flex-shrink: 0;

        // justify-content: center;
        div.action {
            display: flex;
            height: 100%;
            align-items: center;
            justify-content: center;
            aspect-ratio: 1/1;

            &:hover {
                background-color: rgba($color: #ffffff, $alpha: 0.2);
            }

            span {
                font-size: 1rem;
            }
        }
    }
}
</style>