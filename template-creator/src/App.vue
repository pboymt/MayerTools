<script setup lang="ts">
import { open, OpenDialogOptions, save, SaveDialogOptions } from "@tauri-apps/api/dialog";
import { readBinaryFile, writeBinaryFile } from "@tauri-apps/api/fs";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { nextTick, ref, watch, onMounted, onUnmounted } from "vue";
import Panel from "./components/Panel.vue";
import Sidebar from "./components/Sidebar.vue";
import FileSelector from "./components/sidebar/FileSelector.vue";
import Preview from "./components/sidebar/Preview.vue";
import RatioSelector from "./components/sidebar/RatioSelector.vue";
import RectList from "./components/sidebar/RectList.vue";
import Toolbar from "./components/sidebar/Toolbar.vue";
import { Project } from "./dtos/Project";
import { setTitle } from "./funcs/title";
import { container as JenesiusModalContainer, config, promptModal } from "jenesius-vue-modal";
import DialogConfirm from './components/dialogs/DialogConfirm.vue';
import ProjectNamePrompt from "./components/dialogs/NewNamePrompt.vue";
import { selectFile } from "./funcs/files";
import { CameraType } from "./dtos/enums";

config({
  backgroundClose: false,
  escClose: false
});

const project = ref<Project>();
const camera = ref<CameraType>(CameraType.CAMERA_ROI);

watch(() => project.value?.name, () => {
  setTitle(project.value?.name, project.value?.filename);
});

function addROI() { project.value?.addROI(); }
async function clearROIs() {
  const result = await openConfirm();
  if (!result) return;
  project.value?.clearROIs();
}
function removeROI() { project.value?.removeROI(); }
function roiGoLeft() { project.value?.moveRoiX(-1); }
function roiGoRight() { project.value?.moveRoiX(1); }
function roiGoUp() { project.value?.moveRoiY(-1); }
function roiGoDown() { project.value?.moveRoiY(1); }
function roiWidthExpand() { project.value?.changeRoiWidth(1); }
function roiHeightExpand() { project.value?.changeRoiHeight(1); }
function roiWidthShrink() { project.value?.changeRoiWidth(-1); }
function roiHeightShrink() { project.value?.changeRoiHeight(-1); }
function rectGoLeft() { project.value?.selectedROI?.moveRectX(-1); }
function rectGoRight() { project.value?.selectedROI?.moveRectX(1); }
function rectGoUp() { project.value?.selectedROI?.moveRectY(-1); }
function rectGoDown() { project.value?.selectedROI?.moveRectY(1); }
function rectWidthExpand() { project.value?.selectedROI?.changeRectWidth(1); }
function rectHeightExpand() { project.value?.selectedROI?.changeRectHeight(1); }
function rectWidthShrink() { project.value?.selectedROI?.changeRectWidth(-1); }
function rectHeightShrink() { project.value?.selectedROI?.changeRectHeight(-1); }

function switchCamera() {
  camera.value = camera.value === CameraType.CAMERA_ROI ? CameraType.CAMERA_RECT : CameraType.CAMERA_ROI;
}

async function createNewProject() {
  const filename = await selectFile();
  if (!filename) return;
  const newProject = new Project(filename);
  await newProject.loadScreenImage();
  newProject.filename = '*';
  project.value = newProject;
  setTitle(newProject.name);
}

async function saveProject() {
  if (!project.value) return;
  if (project.value.filename.endsWith('.mtrepo')) {
    const data = project.value.toProto();
    await writeBinaryFile(project.value.filename, data);
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
  const result = await promptModal<boolean>(DialogConfirm)
  return result;
}

async function changeProjectName() {
  if (!project.value) return;
  const result = await promptModal<string | null>(ProjectNamePrompt);
  if (result === null) return;
  project.value.name = result;
}

async function changeRoiName() {
  if (!project.value || !project.value.selectedROI) return;
  const selectedROI = project.value.selectedROI;
  const result = await promptModal<string | null>(ProjectNamePrompt);
  if (result === null) return;
  selectedROI.name = result;
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
        <Toolbar @add="addROI" @remove="removeROI" @clear="clearROIs" @roi-left="roiGoLeft" @roi-right="roiGoRight"
          @roi-up="roiGoUp" @roi-down="roiGoDown" @roi-width-expand="roiWidthExpand" @roi-width-shrink="roiWidthShrink"
          @roi-height-expand="roiHeightExpand" @roi-height-shrink="roiHeightShrink" @rect-left="rectGoLeft"
          @rect-right="rectGoRight" @rect-up="rectGoUp" @rect-down="rectGoDown" @rect-width-expand="rectWidthExpand"
          @rect-width-shrink="rectWidthShrink" @rect-height-expand="rectHeightExpand"
          @rect-height-shrink="rectHeightShrink" :camera="camera" @switch="switchCamera" @rename="changeProjectName"
          @roi-rename="changeRoiName" />
        <RectList :rois="project?.rois" :selected="project?.selectedRoiId"
          @select="$event => project && (project.selectedRoiId = $event)" />
      </template>
      <template #bottom>
        <RatioSelector :project="project" />
        <Preview :project="project" />
        <!-- <input class="border-top" type="text" readonly v-model="filename"> -->
        <!-- <FileSelector @change="createNewProject" @save="saveProject" @load="loadProject" /> -->
      </template>
    </Sidebar>

    <Panel v-if="project" :project="project" :camera="camera"></Panel>
  </div>
  <JenesiusModalContainer />
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
