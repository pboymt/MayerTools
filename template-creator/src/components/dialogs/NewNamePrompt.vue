<template>
    <div class="modal-window">
        <div class="title">新的名称</div>
        <div class="content">
            <input type="text" v-model="value" autofocus @input="handleInput" @keypress="handleKeypress">
        </div>
        <div class="buttons">
            <button class="confirm" @click="emit('dialog-event-prompt', value)">确定</button>
            <button class="cancel" @click="emit('dialog-event-prompt', undefined)">取消</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const value = ref("");

const emit = defineEmits(['dialog-event-prompt']);

function handleInput(e: any) {
    const event = e as InputEvent;
    if (!event.isComposing) {
        if (event.data === " ") {
            value.value = value.value.replace(" ", "");
        }
    }
}

function handleKeypress(event: KeyboardEvent) {
    if (!event.isComposing && event.key === 'Enter') {
        emit('dialog-event-prompt', value.value.length ? value.value : undefined);
    }
}
</script>

<style scoped lang="scss">
div.modal-window {
    display: flex;
    flex-direction: column;
    min-width: 15rem;
    min-height: 10rem;
    background-color: var(--background-color);
    box-shadow: 0 0 0.5rem 0.5rem var(--shadow-color);
    border-radius: 5px;
    overflow: hidden;
    user-select: none;

    div.title {
        flex: none;
        display: flex;
        justify-content: start;
        align-items: center;
        font-size: 1.2rem;
        background-color: var(--primary-color);
        padding: 1rem;
    }

    div.content {
        flex: 1;
        display: flex;
        justify-content: start;
        align-items: start;
        font-size: 1rem;
        padding: 1rem;

        input {
            width: 100%;
            background-color: rgba($color: #FFFFFF, $alpha: 0.2);

            border: {
                style: solid;
                width: 1px;
                color: var(--border-color);
            }
        }
    }

    div.buttons {
        flex: none;
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;
        padding: 9;

        button {
            flex: 1;
            border: none;

            &:first-child {
                border-right: 1px solid var(--border-color);
            }
        }
    }
}
</style>