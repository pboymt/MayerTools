<template>
    <div class="rect-item">
        <div class="radio">
            <span v-if="props.rect.uuid === props.selected" class="material-symbols-outlined rotate-90">
                radio_button_checked </span>
            <span v-else class="material-symbols-outlined rotate-90"> radio_button_unchecked </span>
        </div>
        <!-- <div class="value">{{ rect.uuid.slice(-8) }}</div> -->
        <div class="value">{{ rect.x }}</div>
        <div class="value">{{ rect.y }}</div>
        <div class="value">{{ rect.width }}</div>
        <div class="value">{{ rect.height }}</div>
    </div>
</template>

<script setup lang="ts">
import { Rect } from '@/dtos/Rect';

interface Props {
    rect: Rect;
    selected: string;
}

const props = defineProps<Props>();
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

div.rect-item {
    display: flex;
    flex-direction: row;
    height: 3rem;
    line-height: 3rem;
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

        input[type="radio"] {
            margin: 0;
        }
    }

    div.value {
        flex: 1 0 3rem;
        text-align: center;
    }
}
</style>