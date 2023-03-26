<template>
    <button class="toolbar-button" :title="title" :disabled="disabled">
        <span class="material-symbols-outlined" :class="{ rotate90: rotate }"> {{ icon }} </span>
    </button>
</template>

<script setup lang="ts">

interface Props {
    icon: string;
    rotate?: boolean;
    title?: string;
    disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    rotate: false,
    disabled: false,
});
</script>

<style scoped lang="scss">
button.toolbar-button {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 0;
    border: none;
    height: 100%;
    min-width: initial;
    width: auto;
    aspect-ratio: 1/1;
    font-size: 1rem;

    border: {
        left: {
            style: solid;
            width: 1px;
            color: var(--border-color);
        }
    }

    &:nth-child(1) {
        border-left: none;
    }

    span.material-symbols-outlined.rotate90 {
        transform: rotate(90deg);
    }
}
</style>