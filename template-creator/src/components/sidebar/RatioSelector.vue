<template>
    <div class="ratio-selector" v-if="project">
        <div class="radio-item">
            <label> <input type="radio" :value="ScreenRatio.RATIO_FULL" v-model="project.ratio" /> 全屏</label>
        </div>
        <div class="radio-item">
            <label> <input type="radio" :value="ScreenRatio.RATIO_1_2" v-model="project.ratio" /> 1:2</label>
        </div>
        <div class="radio-item">
            <label> <input type="radio" :value="ScreenRatio.RATIO_3_4" v-model="project.ratio" /> 3:4</label>
        </div>
        <div class="radio-item">
            <label> <input type="radio" :value="ScreenRatio.RATIO_9_16" v-model="project.ratio" /> 9:16</label>
        </div>
    </div>
    <div v-else class="ratio-selector">
        请选择图片
    </div>
</template>

<script setup lang="ts">
import { ScreenRatio } from '@/dtos/enums';
import { projectInjectKey } from '@/utils/injects';
import { inject } from 'vue';

const project = inject(projectInjectKey);
</script>

<style scoped lang="scss">
div.ratio-selector {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: stretch;
    flex-grow: 0;
    flex-shrink: 0;
    height: 2rem;
    line-height: 2rem;
    user-select: none;

    border: {
        top: {
            style: solid;
            width: 1px;
            color: var(--border-color);
        }
    }

    div.radio-item {
        flex-basis: 50%;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        padding-left: 0.5rem;
        line-height: 2rem;
        cursor: pointer;

        label {
            display: block;
            flex: 1;
            cursor: pointer;
            padding-right: 0.5rem;
        }

        &:hover {
            background-color: var(--hover-color);
        }

        // input {
        //     margin-right: 0.5rem;
        // }
    }
}
</style>