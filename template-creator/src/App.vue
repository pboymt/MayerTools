<script setup lang="ts">
import Panel from "@/components/Panel.vue";
import Sidebar from "@/components/Sidebar.vue";
import { open, OpenDialogOptions, save, SaveDialogOptions } from "@tauri-apps/api/dialog";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { readBinaryFile, writeBinaryFile } from "@tauri-apps/api/fs";
import { nextTick, onMounted, onUnmounted, provide, ref, watch } from "vue";
// import FileSelector from "./components/sidebar/FileSelector.vue";
import DialogConfirm from '@/components/dialogs/DialogConfirm.vue';
import ProjectNamePrompt from "@/components/dialogs/NewNamePrompt.vue";
import Modal from "@/components/Modal.vue";
import Preview from "@/components/sidebar/Preview.vue";
import RatioSelector from "@/components/sidebar/RatioSelector.vue";
import RectList from "@/components/sidebar/RectList.vue";
import Toolbar from "@/components/sidebar/Toolbar.vue";
import NewPanel from "@/components/NewPanel.vue";
import { CameraType } from "@/interfaces/enums";
import { Project } from "@/interfaces/Project";
import { selectFile } from "@/funcs/files";
import { setTitle } from "@/funcs/title";
import { cameraTypeInjectKey, modalInjectKey, notificationsInjectKey, projectInjectKey } from "@/utils/injects";
import Notifications from "@/components/Notifications.vue";
import { RegionOfInterest } from "@/interfaces/ROI";
import { exportImage } from "@/core/exports/image";
import { exportMTTPL } from "@/core/exports/mttpl";
import { exportJSON } from "@/core/exports/json";
// import { config, container as JenesiusModalContainer, promptModal } from "jenesius-vue-modal";

// config({
//   backgroundClose: false,
//   escClose: false
// });

const project = ref<Project>();
const camera = ref<CameraType>(CameraType.CAMERA_ROI);
const modal = ref<InstanceType<typeof Modal> | null>(null);
const notifications = ref<InstanceType<typeof Notifications> | null>(null);

provide(projectInjectKey, project);
provide(cameraTypeInjectKey, camera);
provide(modalInjectKey, modal);
provide(notificationsInjectKey, notifications);

watch(() => project.value?.name, () => {
  setTitle(project.value?.name, project.value?.filename);
});

/**
 * 添加 ROI
 */
function addROI() { project.value?.addROI(); }

/**
 * 删除所有 ROI
 */
async function clearROIs() {
  if (!project.value) return;
  const result = await openConfirm();
  if (!result) return;
  project.value.clearROIs();
}

/**
 * 删除指定 ROI
 * @param uuid 指定的 ROI UUID，未提供则删除选中的 ROI
 */
function removeROI(uuid?: string) { project.value?.removeROI(uuid); }

/**
 * 复制指定的 ROI
 * @param uuid 指定的 ROI UUID
 */
function duplicateROI(uuid: string) {
  if (!project.value) return;
  project.value.duplicateROI(uuid);
}

/**
 * 切换镜头
 */
function switchCamera() {
  camera.value = camera.value === CameraType.CAMERA_ROI ? CameraType.CAMERA_RECT : CameraType.CAMERA_ROI;
  if (project.value) project.value.cameraType = camera.value;
}

async function createNewProject() {
  const filename = await selectFile();
  if (!filename) return;
  const newProject = new Project(filename);
  await newProject.loadScreenImage();
  newProject.filename = '*';
  project.value = newProject;
  nextTick();
  setTitle(newProject.name);
}

async function saveProject() {
  if (!project.value) return;
  if (project.value.filename.endsWith('.mtrepo')) {
    const data = project.value.toProto();
    await writeBinaryFile(project.value.filename, data);
    notifications.value?.addNotification('保存成功');
    return;
  } else {
    const options: SaveDialogOptions = {
      defaultPath: project.value.name,
      filters: [
        {
          name: "Mayer Templates Repository",
          extensions: ["mtrepo"],
        },
      ],
    };
    const filename = await save(options);
    if (!filename) return;
    const data = project.value.toProto();
    await writeBinaryFile(filename, data);
    project.value.filename = filename;
    notifications.value?.addNotification('保存成功');
  }
  setTitle(project.value.name, project.value.filename);
}

async function loadProject() {
  const options: OpenDialogOptions = {
    filters: [
      {
        name: "Mayer Templates Repository",
        extensions: ["mtrepo"],
      },
    ],
    multiple: false
  };
  const filename = await open(options);
  if (typeof filename !== 'string') return;
  const data = await readBinaryFile(filename);
  const newProject = await Project.fromProto(data);
  await newProject.loadScreenImage(true);
  newProject.filename = filename;
  project.value = newProject;
  setTitle(project.value.name, project.value.filename);
  nextTick();
}

async function openConfirm() {
  const result = await modal.value?.openPrompt<boolean>(DialogConfirm);
  return result;
}

async function changeProjectName() {
  if (!project.value) return;
  const result = await modal.value?.openPrompt<string>(ProjectNamePrompt);
  if (typeof result === 'string') {
    project.value.name = result;
  }
}

async function changeRoiName(uuid?: string) {
  if (!project.value) return;
  let selectedROI: RegionOfInterest | undefined;
  if (typeof uuid === 'string') {
    selectedROI = project.value.rois.get(uuid);
  } else {
    selectedROI = project.value.selectedROI;
  }
  if (!selectedROI) {
    notifications.value?.addNotification('没有选中的 ROI');
    return;
  }
  const result = await modal.value?.openPrompt<string>(ProjectNamePrompt);
  if (typeof result === 'string') {
    selectedROI.name = result;
  }
}

async function exportTo(exType: string) {
  if (project.value?.image) {
    const bitmap = await createImageBitmap(project.value.image);
    switch (exType) {
      case 'fullmap':
        exportImage(bitmap, project.value.toDrawable());
        break;
      case 'mttpl':
        exportMTTPL(bitmap, project.value);
        break;
      case 'json':
        exportJSON(bitmap, project.value);
        break;
      default:
        alert('未知的导出类型');
        break;
    }
  }
}

function showNotification() {
  console.log('showNotification');
  notifications.value?.addNotification('Hello World');
}

let unEventProjectNew: UnlistenFn | undefined;
let unEventProjectOpen: UnlistenFn | undefined;
let unEventProjectSave: UnlistenFn | undefined;
let unEventProjectSaveAs: UnlistenFn | undefined;
let unEventProjectExport: UnlistenFn | undefined;

onMounted(async () => {
  if (project.value) {
    setTitle(project.value.name, project.value.filename);
  } else {
    setTitle();
  }
  unEventProjectNew = await listen('project-new', createNewProject);
  unEventProjectOpen = await listen('project-open', loadProject);
  unEventProjectSave = await listen('project-save', saveProject);
  unEventProjectSaveAs = await listen('project-save-as', () => {
    if (!project.value) return;
    console.log(project.value.toProto());
  });
  unEventProjectExport = await listen('project-export', () => {
    if (!project.value) return;
    console.log(project.value.toJSON());
  });
});

onUnmounted(() => {
  if (typeof unEventProjectNew === 'function') unEventProjectNew();
  if (typeof unEventProjectOpen === 'function') unEventProjectOpen();
  if (typeof unEventProjectSave === 'function') unEventProjectSave();
  if (typeof unEventProjectSaveAs === 'function') unEventProjectSaveAs();
  if (typeof unEventProjectExport === 'function') unEventProjectExport();
});
</script>

<template>
  <div class="container">
    <Sidebar>
      <template #top>
        <Toolbar @add="addROI" @remove="removeROI" @clear="clearROIs" @switch="switchCamera" @rename="changeProjectName"
          @roi-rename="changeRoiName" @project-export="exportTo" />
        <RectList :rois="project?.rois" :selected="project?.selectedRoiId"
          @select="($event: string) => project && (project.selectedRoiId = $event)" @rename="changeRoiName"
          @remove="removeROI" @duplicate="duplicateROI" />
      </template>
      <template #bottom>
        <RatioSelector />
        <Preview />
        <!-- <input class="border-top" type="text" readonly v-model="filename"> -->
        <!-- <FileSelector @change="createNewProject" @save="saveProject" @load="loadProject" /> -->
      </template>
    </Sidebar>

    <!-- <Panel v-if="project" /> -->
    <NewPanel v-if="project" />
  </div>
  <!-- <JenesiusModalContainer /> -->
  <Modal ref="modal" />
  <Notifications ref="notifications" />
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: row;
  justify-content: stretch;
  align-items: stretch;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>
