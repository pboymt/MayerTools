<template>
    <div class="sidebar">
        <div class="menu-top">
            <slot name="top"></slot>
        </div>
        <div class="menu-bottom">
            <slot name="bottom"></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import FileSelector from './sidebar/FileSelector.vue';
</script>

<style lang="scss" scoped>
@import "@/styles/theme.scss";

div.sidebar {
    display: flex;
    flex-direction: column;
    justify-content: stretch;
    align-items: stretch;
    background-color: var(--background-color);
    color: var(--foreground-color);
    width: 21rem;
    overflow: hidden;

    border: {
        right: {
            width: 1px;
            style: solid;
            color: var(--border-color);
        }
    }

    @mixin menu {
        flex-grow: 1;
        flex-shrink: 1;
        overflow: hidden;
        align-items: stretch;
        justify-content: stretch;
    }

    .menu {
        &-top {
            @include menu;
            display: flex;
            flex-direction: column;
        }

        &-bottom {
            @include menu;
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
            justify-content: end;
        }
    }
}
</style>