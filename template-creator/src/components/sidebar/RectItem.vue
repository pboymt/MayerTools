<template>
    <div class="rect-item">
        <div class="radio">
            <span v-if="roi.uuid === selected" class="material-symbols-outlined rotate-90">
                radio_button_checked </span>
            <span v-else class="material-symbols-outlined rotate-90"> radio_button_unchecked </span>
        </div>
        <div class="value">{{ roi.name }}</div>
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
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

div.rect-item {
    display: flex;
    flex-direction: row;
    height: 2rem;
    line-height: 2rem;
    cursor: pointer;

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

    div.value {
        flex: 1 0 2rem;
        text-align: start;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
    }
}
</style>