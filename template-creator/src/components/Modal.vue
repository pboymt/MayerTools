<template>
    <Transition>
        <div class="global-mask" v-if="show" @click="closeModal">
            <div class="content" @click="$event.stopPropagation()">
                <component :is="componentVue" @dialog-event-prompt="handlePrompt"></component>
            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { DefineComponent, shallowRef } from 'vue';
import { ref } from 'vue';

const show = ref(false);
const componentVue = shallowRef<DefineComponent | null>(null);
const promptPromise = ref<((value: any) => void) | null>(null);

function showModal(component: DefineComponent) {
    componentVue.value = component;
    show.value = true;
}

function closeModal() {
    promptPromise.value?.(undefined);
    promptPromise.value = null;
    componentVue.value = null;
    show.value = false;
}

function openPrompt<T>(component: DefineComponent<any, any, any, any, any, any, any, any, any, any>): Promise<T | undefined> {
    showModal(component);
    return new Promise<T>((resovle, reject) => {
        promptPromise.value = resovle;
    });
}

function handlePrompt($event: any) {
    promptPromise.value?.($event);
    closeModal();
}

defineExpose({
    showModal,
    closeModal,
    openPrompt
});
</script>

<style scoped lang="scss">
div.global-mask {
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 1000;
    background-color: rgba(0, 0, 0, 0.5);
    cursor: pointer;

    div.content {
        cursor: default;
        // width: 5rem;
        // height: 5rem;
        // background-color: #fff;
    }
}

.v-enter-active,
.v-leave-active {
    transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
    opacity: 0;
}
</style>