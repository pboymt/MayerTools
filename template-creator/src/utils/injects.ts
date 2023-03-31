import type { InjectionKey, Ref, ShallowRef } from 'vue';
import { Project } from '@/dtos/Project';
import { CameraType } from '@/dtos/enums';
import type ModalVue from '@/components/Modal.vue';
import type NotificationsVue from '@/components/Notifications.vue';

export const projectInjectKey = Symbol() as InjectionKey<Ref<Project | undefined>>;
export const cameraTypeInjectKey = Symbol() as InjectionKey<Ref<CameraType>>;
export const modalInjectKey = Symbol() as InjectionKey<Ref<InstanceType<typeof ModalVue>>>;
export const notificationsInjectKey = Symbol() as InjectionKey<Ref<InstanceType<typeof NotificationsVue>>>;