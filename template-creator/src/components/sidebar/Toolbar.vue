<template>
    <div class="toolbar">
        <div class="toolbar-label">
            操作
        </div>
        <ToolbarButton icon="add" @click="emit('add')" title="添加 ROI" />
        <!-- <ToolbarButton icon="remove" @click="emit('remove')" disabled title="移除选中的 ROI" /> -->
        <ToolbarButton icon="clear_all" @click="emit('clear')" title="清除所有的 ROI" />
        <ToolbarButton icon="photo_library" title="导出示意图" @click="emit('project-export', 'fullmap')" />
        <ToolbarButton icon="data_object" title="导出 JSON" @click="emit('project-export', 'json')" />
        <ToolbarButton icon="ungroup" title="导出模板文件" @click="emit('project-export', 'mttpl')" />
        <ToolbarButton icon="edit" title="重命名项目" @click="emit('rename')" />
        <ToolbarButton icon="tune" disabled title="设置" />
        <ToolbarButton icon="cameraswitch" @click="emit('switch')" title="切换 ROI 和 Rect" />
    </div>
    <div class="toolbar">
        <div class="toolbar-label" :class="{ camera: camera === CameraType.CAMERA_ROI }">
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
            @mouseup="mouseUp('roi-width-expand')" @wheel="onRoiWheel($event, 'roi', false)" title="加宽" />
        <ToolbarButton icon="unfold_less" rotate @mousedown="mouseDown('roi-width-shrink')"
            @mouseup="mouseUp('roi-width-shrink')" @wheel="onRoiWheel($event, 'roi', false)" title="收窄" />
        <ToolbarButton icon="unfold_more" @mousedown="mouseDown('roi-height-expand')"
            @mouseup="mouseUp('roi-height-expand')" @wheel="onRoiWheel($event, 'roi', true)" title="增高" />
        <ToolbarButton icon="unfold_less" @mousedown="mouseDown('roi-height-shrink')"
            @mouseup="mouseUp('roi-height-shrink')" @wheel="onRoiWheel($event, 'roi', true)" title="变低" />
    </div>
    <div class="toolbar">
        <div class="toolbar-label" :class="{ camera: camera === CameraType.CAMERA_RECT }">
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
            @mouseup="mouseUp('rect-width-expand')" @wheel="onRoiWheel($event, 'rect', false)" title="加宽" />
        <ToolbarButton icon="unfold_less" rotate @mousedown="mouseDown('rect-width-shrink')"
            @mouseup="mouseUp('rect-width-shrink')" @wheel="onRoiWheel($event, 'rect', false)" title="收窄" />
        <ToolbarButton icon="unfold_more" @mousedown="mouseDown('rect-height-expand')"
            @mouseup="mouseUp('rect-height-expand')" @wheel="onRoiWheel($event, 'rect', true)" title="增高" />
        <ToolbarButton icon="unfold_less" @mousedown="mouseDown('rect-height-shrink')"
            @mouseup="mouseUp('rect-height-shrink')" @wheel="onRoiWheel($event, 'rect', true)" title="变低" />
    </div>
</template>

<script setup lang="ts">
import { CameraType } from '@/interfaces/enums';
import { cameraTypeInjectKey, projectInjectKey } from '@/utils/injects';
import { inject, onBeforeUnmount, onMounted } from 'vue';
import ToolbarButton from '@/components/sidebar/toolbar/ToolbarButton.vue';


const emit = defineEmits(['add', 'remove', 'clear', 'switch', 'rename', 'roi-rename', 'project-export',
    'roi-left', 'roi-right', 'roi-up', 'roi-down', 'roi-width-expand', 'roi-width-shrink', 'roi-height-expand', 'roi-height-shrink',
    'rect-left', 'rect-right', 'rect-up', 'rect-down', 'rect-width-expand', 'rect-width-shrink', 'rect-height-expand', 'rect-height-shrink'
]);

const project = inject(projectInjectKey, null);
const camera = inject(cameraTypeInjectKey);

type EventTypes = Parameters<typeof emit>[0]

// an object with key as event type and value as function

const mouseActive: Record<EventTypes, boolean> = {
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
    // others
    add: false,
    remove: false,
    clear: false,
    switch: false,
    rename: false,
    'roi-rename': false,
    'project-export': false,
};

const mouseFuncs: Record<EventTypes, () => void> = {
    'roi-left'() { project?.value?.moveRoiX(-1); },
    'roi-right'() { project?.value?.moveRoiX(1); },
    'roi-up'() { project?.value?.moveRoiY(-1); },
    'roi-down'() { project?.value?.moveRoiY(1); },
    'roi-width-expand'() { project?.value?.changeRoiWidth(1); },
    'roi-height-expand'() { project?.value?.changeRoiHeight(1); },
    'roi-width-shrink'() { project?.value?.changeRoiWidth(-1); },
    'roi-height-shrink'() { project?.value?.changeRoiHeight(-1); },
    'rect-left'() { project?.value?.selectedROI?.moveRectX(-1); },
    'rect-right'() { project?.value?.selectedROI?.moveRectX(1); },
    'rect-up'() { project?.value?.selectedROI?.moveRectY(-1); },
    'rect-down'() { project?.value?.selectedROI?.moveRectY(1); },
    'rect-width-expand'() { project?.value?.selectedROI?.changeRectWidth(1); },
    'rect-height-expand'() { project?.value?.selectedROI?.changeRectHeight(1); },
    'rect-width-shrink'() { project?.value?.selectedROI?.changeRectWidth(-1); },
    'rect-height-shrink'() { project?.value?.selectedROI?.changeRectHeight(-1); },
    // others
    add() { emit('add') },
    remove() { emit('remove') },
    clear() { emit('clear') },
    switch() {
        switch (camera?.value) {
            case CameraType.CAMERA_ROI:
                camera.value = CameraType.CAMERA_RECT;
                break;
            case CameraType.CAMERA_RECT:
                camera.value = CameraType.CAMERA_ROI;
                break;
        }
    },
    rename() { emit('rename') },
    'roi-rename'() { emit('roi-rename') },
    'project-export'() { emit('project-export') },
}
let timeout = 0;
// When the mouse is pressed, an event is triggered. After waiting for 500 ms, if the mouse button is not raised, the event is continuously triggered at 50 ms intervals.

function mouseDown(event: EventTypes, keyboard = false) {
    if (keyboard) {
        mouseFuncs[event]();
        return;
    }
    if (!mouseActive[event]) {
        mouseActive[event] = true;
        // 执行一次
        mouseFuncs[event]();
        setTimeout(() => {
            // 500ms后如果还未抬起就循环执行
            if (mouseActive[event]) {
                const interval = setInterval(() => {
                    if (mouseActive[event]) {
                        mouseFuncs[event]();
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
            mouseDown(camera?.value === CameraType.CAMERA_RECT ? 'rect-left' : 'roi-left');
            break;
        case ['d', 'D', 'ArrowRight'].includes(key):
            mouseDown(camera?.value === CameraType.CAMERA_RECT ? 'rect-right' : 'roi-right');
            break;
        case ['w', 'W', 'ArrowUp'].includes(key):
            mouseDown(camera?.value === CameraType.CAMERA_RECT ? 'rect-up' : 'roi-up');
            break;
        case ['s', 'S', 'ArrowDown'].includes(key):
            mouseDown(camera?.value === CameraType.CAMERA_RECT ? 'rect-down' : 'roi-down');
            break;
    }
}

function keyUp($event: KeyboardEvent) {
    const key = $event.key;
    switch (true) {
        case ['a', 'A', 'ArrowLeft'].includes(key):
            camera?.value === CameraType.CAMERA_ROI ? mouseUp('roi-left') : mouseUp('rect-left');
            break;
        case ['d', 'D', 'ArrowRight'].includes(key):
            camera?.value === CameraType.CAMERA_ROI ? mouseUp('roi-right') : mouseUp('rect-right');
            break;
        case ['w', 'W', 'ArrowUp'].includes(key):
            camera?.value === CameraType.CAMERA_ROI ? mouseUp('roi-up') : mouseUp('rect-up');
            break;
        case ['s', 'S', 'ArrowDown'].includes(key):
            camera?.value === CameraType.CAMERA_ROI ? mouseUp('roi-down') : mouseUp('rect-down');
            break;
    }
}

function onRoiWheel($event: WheelEvent, type: 'roi' | 'rect', height = false) {
    if (height) {
        if ($event.deltaY > 0) {
            mouseFuncs[`${type}-height-shrink`]();
        } else {
            mouseFuncs[`${type}-height-expand`]();
        }
    } else {
        if ($event.deltaY > 0) {
            mouseFuncs[`${type}-width-shrink`]();
        } else {
            mouseFuncs[`${type}-width-expand`]();
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