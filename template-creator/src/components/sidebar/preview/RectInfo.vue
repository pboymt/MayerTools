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
        <div class="attr-values">
            <div class="attr-value">
                {{ project?.selectedROI?.x }}
            </div>
            <div class="attr-value">
                {{ project?.selectedROI?.y }}
            </div>
            <div class="attr-value">
                {{ project?.selectedROI?.width }}
            </div>
            <div class="attr-value">
                {{ project?.selectedROI?.height }}
            </div>
            <div class="attr-value">
                {{ project?.selectedROI?.rect.x }}
            </div>
            <div class="attr-value">
                {{ project?.selectedROI?.rect.y }}
            </div>
            <div class="attr-value">
                {{ project?.selectedROI?.rect.width }}
            </div>
            <div class="attr-value">
                {{ project?.selectedROI?.rect.height }}
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
        flex-grow: 1;

        div.attr-value {
            display: flex;
            align-items: center;
            justify-content: end;
            flex-grow: 1;
            box-sizing: border-box;
            padding-right: 1rem;

            &:nth-child(2n) {
                background-color: rgba($color: #616161, $alpha: 0.5);
            }
        }
    }
}
</style>