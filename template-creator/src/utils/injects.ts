import type { InjectionKey, Ref } from 'vue';
import { Project } from '@/dtos/Project';
import { CameraType } from '@/dtos/enums';

export const projectInjectKey = Symbol() as InjectionKey<Ref<Project | undefined>>;
export const cameraTypeInjectKey = Symbol() as InjectionKey<Ref<CameraType>>;