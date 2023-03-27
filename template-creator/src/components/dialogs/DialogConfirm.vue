<template>
    <div class="modal-window">
        <div class="title">确定？</div>
        <div class="content">你确定要这么做吗？</div>
        <div class="buttons">
            <button class="confirm" @click="emit(Modal.EVENT_PROMPT, true)">是</button>
            <button class="cancel" @click="emit(Modal.EVENT_PROMPT, false)">否</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Modal } from "jenesius-vue-modal";

const emit = defineEmits([Modal.EVENT_PROMPT]);

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