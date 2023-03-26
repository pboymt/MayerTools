<template>
    <div class="toolbar">
        <div class="toolbar-label">
            操作
        </div>
        <ToolbarButton icon="add" @click="emit('add')" title="添加 ROI" />
        <ToolbarButton icon="remove" @click="emit('remove')" title="移除选中的 ROI" />
        <ToolbarButton icon="clear_all" @click="emit('clear')" title="清除所有的 ROI" />
        <ToolbarButton icon="chip_extraction" disabled title="导出" />
        <ToolbarButton icon="edit" disabled title="重命名项目" />
        <ToolbarButton icon="edit_note" disabled title="重命名选中的 ROI" />
        <ToolbarButton icon="tune" disabled title="设置" />
        <ToolbarButton icon="cameraswitch" @click="emit('switch')" title="切换 ROI 和 Rect" />
    </div>
    <div class="toolbar">
        <div class="toolbar-label" :class="{ camera: camera === 'ROI' }">
            区域
        </div>
        <ToolbarButton icon="keyboard_arrow_left" @mousedown="mouseDown('roi-left')" @mouseup="mouseUp('roi-left')"
            title="左移" />
        <ToolbarButton icon="keyboard_arrow_right" @mousedown="mouseDown('roi-right')" @mouseup="mouseUp('roi-right')"
            title="右移" />
        <ToolbarButton icon="keyboard_arrow_up" @mousedown="mouseDown('roi-up')" @mouseup="mouseUp('roi-up')" title="上移" />
        <ToolbarButton icon="keyboard_arrow_down" @mousedown="mouseDown('roi-down')" @mouseup="mouseUp('roi-down')"
            title="下移" />
        <ToolbarButton icon="unfold_more" rotate @mousedown="mouseDown('roi-width-expand')"
            @mouseup="mouseUp('roi-width-expand')" @wheel="onWheel($event, false)" title="加宽" />
        <ToolbarButton icon="unfold_less" rotate @mousedown="mouseDown('roi-width-shrink')"
            @mouseup="mouseUp('roi-width-shrink')" @wheel="onWheel($event, false)" title="收窄" />
        <ToolbarButton icon="unfold_more" @mousedown="mouseDown('roi-height-expand')"
            @mouseup="mouseUp('roi-height-expand')" @wheel="onWheel($event, true)" title="增高" />
        <ToolbarButton icon="unfold_less" @mousedown="mouseDown('roi-height-shrink')"
            @mouseup="mouseUp('roi-height-shrink')" @wheel="onWheel($event, true)" title="变低" />
    </div>
    <div class="toolbar">
        <div class="toolbar-label" :class="{ camera: camera === 'Rect' }">
            模板
        </div>
        <ToolbarButton icon="keyboard_arrow_left" @mousedown="mouseDown('rect-left')" @mouseup="mouseUp('rect-left')"
            title="左移" />
        <ToolbarButton icon="keyboard_arrow_right" @mousedown="mouseDown('rect-right')" @mouseup="mouseUp('rect-right')"
            title="右移" />
        <ToolbarButton icon="keyboard_arrow_up" @mousedown="mouseDown('rect-up')" @mouseup="mouseUp('rect-up')"
            title="上移" />
        <ToolbarButton icon="keyboard_arrow_down" @mousedown="mouseDown('rect-down')" @mouseup="mouseUp('rect-down')"
            title="下移" />
        <ToolbarButton icon="unfold_more" rotate @mousedown="mouseDown('rect-width-expand')"
            @mouseup="mouseUp('rect-width-expand')" @wheel="onWheel($event, false)" title="加宽" />
        <ToolbarButton icon="unfold_less" rotate @mousedown="mouseDown('rect-width-shrink')"
            @mouseup="mouseUp('rect-width-shrink')" @wheel="onWheel($event, false)" title="收窄" />
        <ToolbarButton icon="unfold_more" @mousedown="mouseDown('rect-height-expand')"
            @mouseup="mouseUp('rect-height-expand')" @wheel="onWheel($event, true)" title="增高" />
        <ToolbarButton icon="unfold_less" @mousedown="mouseDown('rect-height-shrink')"
            @mouseup="mouseUp('rect-height-shrink')" @wheel="onWheel($event, true)" title="变低" />
    </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue';
import ToolbarButton from './toolbar/ToolbarButton.vue';

interface Props {
    camera: 'Rect' | 'ROI';
}

const emit = defineEmits(['add', 'remove', 'clear', 'switch',
    'roi-left', 'roi-right', 'roi-up', 'roi-down', 'roi-width-expand', 'roi-width-shrink', 'roi-height-expand', 'roi-height-shrink',
    'rect-left', 'rect-right', 'rect-up', 'rect-down', 'rect-width-expand', 'rect-width-shrink', 'rect-height-expand', 'rect-height-shrink'
]);
const props = withDefaults(defineProps<Props>(), {
    camera: 'ROI',
});

const mouseActive = {
    // ROI
    'roi-left': false,
    'roi-right': false,
    'roi-up': false,
    'roi-down': false,
    'roi-width-expand': false,
    'roi-width-shrink': false,
    'roi-height-expand': false,
    'roi-height-shrink': false,
    // Rect
    'rect-left': false,
    'rect-right': false,
    'rect-up': false,
    'rect-down': false,
    'rect-width-expand': false,
    'rect-width-shrink': false,
    'rect-height-expand': false,
    'rect-height-shrink': false,
}
let timeout = 0;
// When the mouse is pressed, an event is triggered. After waiting for 500 ms, if the mouse button is not raised, the event is continuously triggered at 50 ms intervals.

function mouseDown(event: keyof typeof mouseActive, keyboard = false) {
    if (keyboard) {
        emit(event);
        return;
    }
    if (!mouseActive[event]) {
        mouseActive[event] = true
        emit(event)
        setTimeout(() => {
            if (mouseActive[event]) {
                const interval = setInterval(() => {
                    if (mouseActive[event]) {
                        emit(event)
                    } else {
                        clearInterval(interval)
                    }
                }, 10)
            }
        }, 500)
    }
}

function mouseUp(event: keyof typeof mouseActive) {
    mouseActive[event] = false
    clearTimeout(timeout)
}

function keyDown($event: KeyboardEvent) {
    if ($event.repeat) return;
    const key = $event.key;
    // console.log(key);
    switch (true) {
        case ['a', 'A', 'ArrowLeft'].includes(key):
            mouseDown(props.camera === 'Rect' ? 'rect-left' : 'roi-left');
            break;
        case ['d', 'D', 'ArrowRight'].includes(key):
            mouseDown(props.camera === 'Rect' ? 'rect-right' : 'roi-right');
            break;
        case ['w', 'W', 'ArrowUp'].includes(key):
            mouseDown(props.camera === 'Rect' ? 'rect-up' : 'roi-up');
            break;
        case ['s', 'S', 'ArrowDown'].includes(key):
            mouseDown(props.camera === 'Rect' ? 'rect-down' : 'roi-down');
            break;
    }
}

function keyUp($event: KeyboardEvent) {
    const key = $event.key;
    switch (true) {
        case ['a', 'A'].includes(key):
            props.camera === 'ROI' ? mouseUp('roi-left') : mouseUp('rect-left');
            break;
        case ['d', 'D'].includes(key):
            props.camera === 'ROI' ? mouseUp('roi-right') : mouseUp('rect-right');
            break;
        case ['w', 'W'].includes(key):
            props.camera === 'ROI' ? mouseUp('roi-up') : mouseUp('rect-up');
            break;
        case ['s', 'S'].includes(key):
            props.camera === 'ROI' ? mouseUp('roi-down') : mouseUp('rect-down');
            break;
    }
}

function onWheel($event: WheelEvent, height = false) {
    if (height) {
        if ($event.deltaY > 0) {
            emit('roi-height-shrink');
        } else {
            emit('roi-height-expand');
        }
    } else {
        if ($event.deltaY > 0) {
            emit('roi-width-shrink');
        } else {
            emit('roi-width-expand');
        }
    }

}

onMounted(() => {
    window.addEventListener('keydown', keyDown)
    window.addEventListener('keyup', keyUp)
})

onBeforeUnmount(() => {
    window.removeEventListener('keydown', keyDown)
    window.removeEventListener('keyup', keyUp)
})
</script>

<style scoped lang="scss">
div.toolbar {
    height: 2rem;
    display: flex;
    flex-direction: row;
    justify-content: start;
    align-items: center;
    flex-grow: 0;
    flex-shrink: 0;
    user-select: none;

    border: {
        bottom: {
            style: solid;
            width: 1px;
            color: var(--border-color);
        }
    }

    div.toolbar-label {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        padding: 0;
        border: none;
        height: 100%;
        min-width: initial;
        width: auto;
        aspect-ratio: 2/1;
        font-size: 1rem;

        &.camera {
            color: var(--secondary-color-focus);
        }
    }
}
</style>