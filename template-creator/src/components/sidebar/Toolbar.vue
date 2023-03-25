<template>
    <div class="toolbar">
        <button class="toolbar-button" @click="emit('add')">
            <span class="material-symbols-outlined"> add </span>
        </button>
        <button class="toolbar-button" @click="emit('remove')">
            <span class="material-symbols-outlined"> remove </span>
        </button>
        <button class="toolbar-button" @click="emit('clear')">
            <span class="material-symbols-outlined"> clear_all </span>
        </button>
        <button class="toolbar-button" @mousedown="mouseDown('left')" @mouseup="mouseUp('left')" title="左移">
            <span class="material-symbols-outlined">
                keyboard_arrow_left
            </span>
        </button>
        <button class="toolbar-button" @mousedown="mouseDown('right')" @mouseup="mouseUp('right')" title="右移">
            <span class="material-symbols-outlined">
                keyboard_arrow_right
            </span>
        </button>
        <button class="toolbar-button" @mousedown="mouseDown('up')" @mouseup="mouseUp('up')" title="上移">
            <span class="material-symbols-outlined">
                keyboard_arrow_up
            </span>
        </button>
        <button class="toolbar-button" @mousedown="mouseDown('down')" @mouseup="mouseUp('down')" title="下移">
            <span class="material-symbols-outlined">
                keyboard_arrow_down
            </span>
        </button>
    </div>
    <div class="toolbar">
        <button class="toolbar-button" disabled title="导出">
            <span class="material-symbols-outlined">
                chip_extraction
            </span>
        </button>
        <button class="toolbar-button" disabled title="重命名项目">
            <span class="material-symbols-outlined">
                edit
            </span>
        </button>
        <button class="toolbar-button" disabled title="重命名模板">
            <span class="material-symbols-outlined">
                edit_note
            </span>
        </button>
        <button class="toolbar-button" @mousedown="mouseDown('width-expand')" @mouseup="mouseUp('width-expand')"
            @wheel="onWheel($event, false)" title="加宽">
            <span class="material-symbols-outlined rotate-90"> unfold_more </span>
        </button>
        <button class="toolbar-button" @mousedown="mouseDown('width-shrink')" @mouseup="mouseUp('width-shrink')"
            @wheel="onWheel($event, false)" title="收窄">
            <span class="material-symbols-outlined rotate-90"> unfold_less </span>
        </button>
        <button class="toolbar-button" @mousedown="mouseDown('height-expand')" @mouseup="mouseUp('height-expand')"
            @wheel="onWheel($event, true)" title="增高">
            <span class="material-symbols-outlined"> unfold_more </span>
        </button>
        <button class="toolbar-button" @mousedown="mouseDown('height-shrink')" @mouseup="mouseUp('height-shrink')"
            @wheel="onWheel($event, true)" title="变低">
            <span class="material-symbols-outlined"> unfold_less </span>
        </button>
    </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue';

const emit = defineEmits(['add', 'remove', 'clear', 'left', 'right', 'up', 'down', 'width-expand', 'width-shrink', 'height-expand', 'height-shrink'])

const mouseActive = {
    left: false,
    right: false,
    up: false,
    down: false,
    'width-expand': false,
    'width-shrink': false,
    'height-expand': false,
    'height-shrink': false
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
    console.log(key);
    switch (true) {
        case ['a', 'A', 'ArrowLeft'].includes(key):
            mouseDown('left');
            break;
        case ['d', 'D', 'ArrowRight'].includes(key):
            mouseDown('right');
            break;
        case ['w', 'W', 'ArrowUp'].includes(key):
            mouseDown('up');
            break;
        case ['s', 'S', 'ArrowDown'].includes(key):
            mouseDown('down');
            break;
    }
}

function keyUp($event: KeyboardEvent) {
    const key = $event.key;
    switch (true) {
        case ['a', 'A'].includes(key):
            mouseUp('left');
            break;
        case ['d', 'D'].includes(key):
            mouseUp('right');
            break;
        case ['w', 'W'].includes(key):
            mouseUp('up');
            break;
        case ['s', 'S'].includes(key):
            mouseUp('down');
            break;
    }
}

function onWheel($event: WheelEvent, height = false) {
    if (height) {
        if ($event.deltaY > 0) {
            emit('height-shrink');
        } else {
            emit('height-expand');
        }
    } else {
        if ($event.deltaY > 0) {
            emit('width-shrink');
        } else {
            emit('width-expand');
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
    height: 3rem;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    flex-grow: 0;
    flex-shrink: 0;

    border: {
        bottom: {
            style: solid;
            width: 1px;
            color: var(--border-color);
        }
    }

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

        span.material-symbols-outlined.rotate-90 {
            transform: rotate(90deg);
        }
    }
}
</style>