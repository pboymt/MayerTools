<template>
    <div class="rect-info">
        <div class="attr-class">
            <div class="attr-class-label">区域</div>
            <div class="attr-class-label">模板</div>
        </div>
        <div class="attr-labels">
            <div class="attr-label">X</div>
            <div class="attr-label">Y</div>
            <div class="attr-label">W</div>
            <div class="attr-label">H</div>
            <div class="attr-label">X</div>
            <div class="attr-label">Y</div>
            <div class="attr-label">W</div>
            <div class="attr-label">H</div>
        </div>
        <div class="attr-values" v-if="project?.selectedROI">
            <div class="attr-value">
                <input type="number" v-model="project.selectedROI.x" @keydown="$event.stopPropagation()">
            </div>
            <div class="attr-value">
                <input type="number" v-model="project.selectedROI.y" @keydown="$event.stopPropagation()">
            </div>
            <div class="attr-value">
                <input type="number" v-model="project.selectedROI.width" @keydown="$event.stopPropagation()">
            </div>
            <div class="attr-value">
                <input type="number" v-model="project.selectedROI.height" @keydown="$event.stopPropagation()">
            </div>
            <div class="attr-value">
                <input type="number" v-model="project.selectedROI.rect.x" @keydown="$event.stopPropagation()">
            </div>
            <div class="attr-value">
                <input type="number" v-model="project.selectedROI.rect.y" @keydown="$event.stopPropagation()">
            </div>
            <div class="attr-value">
                <input type="number" v-model="project.selectedROI.rect.width" @keydown="$event.stopPropagation()">
            </div>
            <div class="attr-value">
                <input type="number" v-model="project.selectedROI.rect.height" @keydown="$event.stopPropagation()">
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { projectInjectKey } from '@/utils/injects';
import { inject } from 'vue';

const project = inject(projectInjectKey);
</script>

<style scoped lang="scss">
div.rect-info {
    display: flex;
    flex-direction: row;
    background-color: var(--background-color);
    flex: 1;
    user-select: none;

    border: {
        right: {
            width: 1px;
            style: solid;
            color: var(--border-color);
        }
    }

    div.attr-class {
        display: flex;
        flex-direction: column;
        width: 1.5rem;

        border: {
            right: {
                width: 1px;
                style: solid;
                color: var(--border-color);
            }
        }

        div.attr-class-label {
            display: flex;
            align-items: center;
            justify-content: center;
            writing-mode: vertical-lr;
            flex-grow: 1;
        }
    }

    div.attr-labels {
        display: flex;
        flex-direction: column;
        width: 1.5rem;
        flex-shrink: 0;

        border: {
            right: {
                width: 1px;
                style: solid;
                color: var(--border-color);
            }
        }

        div.attr-label {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-grow: 1;
            box-sizing: border-box;

            &:nth-child(2n) {
                background-color: rgba($color: #616161, $alpha: 0.5);
            }
        }
    }

    div.attr-values {
        display: flex;
        flex-direction: column;
        // flex: 0 0 5rem;
        overflow: hidden;

        div.attr-value {
            display: flex;
            align-items: center;
            justify-content: end;
            box-sizing: border-box;

            &:nth-child(2n) {
                background-color: rgba($color: #616161, $alpha: 0.5);
            }

            input {
                display: block;
                // flex: 1 1 auto;
                width: 100%;
                flex-shrink: 1;
                line-height: 1.5rem;
                text-align: right;
                // height: 0.5rem;
                padding: 0 0 0 0.25rem;
                font-size: 1rem;
            }
        }
    }
}
</style>