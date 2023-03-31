<template>
    <div class="notifications-container">
        <TransitionGroup name="list">
            <div class="notification" v-for="[uuid, item] in list" :key="uuid">
                <div class="content">
                    {{ item }}
                </div>
                <div class="actions" @click="closeNotification(uuid)">
                    <span class="material-symbols-outlined"> close </span>
                </div>
            </div>
        </TransitionGroup>
    </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

const list = ref(new Map<string, string>());
const timeoutList = ref(new Map<string, number>());

function addNotification(message: string, timeout = 5000) {
    console.log('addNotification', message);
    const uuid = crypto.randomUUID();
    list.value.set(uuid, message);
    timeoutList.value.set(uuid, window.setTimeout(() => {
        list.value.delete(uuid);
        timeoutList.value.delete(uuid);
    }, timeout));
    return uuid;
}

function closeNotification(uuid: string) {
    console.log('closeNotification', uuid);
    list.value.delete(uuid);
    const timeout = timeoutList.value.get(uuid);
    if (timeout) {
        window.clearTimeout(timeout);
        timeoutList.value.delete(uuid);
    }
}

defineExpose({
    addNotification
});

onMounted(() => {
});

onBeforeUnmount(() => {
});
</script>

<style scoped lang="scss">
div.notifications-container {
    --notification-width: 10rem;
    --notification-height: 2rem;
    position: fixed;
    display: flex;
    flex-direction: column;
    align-items: end;
    top: 0;
    right: 0;
    // bottom: 0;
    width: 1px;
    z-index: 2000;
    background-color: var(--background-color);
    // box-shadow: 0 0 0.5rem 0.5rem var(--shadow-color);
    border-radius: 5px;
    // overflow: hidden;
    user-select: none;
    // text-align: right;

    div.notification {
        // position: relative;
        flex: none;
        display: flex;
        flex-direction: row;
        justify-content: start;
        align-items: stretch;
        font-size: 1rem;
        background-color: var(--primary-color);
        padding: 0.2rem;
        padding-left: 1rem;
        margin: 0.5rem;
        margin-right: 0;
        width: var(--notification-width);
        min-width: var(--notification-width);
        max-width: var(--notification-width);
        height: var(--notification-height);
        min-height: var(--notification-height);
        max-height: var(--notification-height);
        overflow: hidden;
        border-radius: 5px 0 0 5px;
        box-shadow: 0 0 0.5rem 0.5rem var(--shadow-color);
        cursor: pointer;
        // transform: translateX(0);

        &:hover {
            background-color: var(--primary-color-hover);
        }

        div.icon {
            flex: none;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 2rem;
            height: 2rem;
            margin-right: 1rem;
            border-radius: 50%;
            background-color: var(--primary-color);
            box-shadow: 0 0 0.5rem 0.5rem var(--shadow-color);

            svg {
                width: 1.5rem;
                height: 1.5rem;
                fill: var(--text-color);
            }
        }

        div.content {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: start;
            align-items: start;
            font-size: 1rem;
            // padding: 1rem;
            color: var(--text-color);
        }

        div.actions {
            // flex: none;
            // font-size: 0.5rem;
            display: flex;
            align-items: center;

            span.material-symbols-outlined {
                font-size: 1rem;
            }
        }
    }
}

.list-enter-active,
.list-leave-active {
    transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
    opacity: 0;
    transform: translateX(100%);
}

.list-leave-active {
    // position: absolute;
    z-index: 1999;
}
</style>