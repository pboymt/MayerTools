<script setup lang="ts">
import { ref } from "vue";
import Panel from "./components/Panel.vue";
import Sidebar from "./components/Sidebar.vue";
import FileSelector from "./components/sidebar/FileSelector.vue";
import Preview from "./components/sidebar/Preview.vue";
import RatioSelector from "./components/sidebar/RatioSelector.vue";
import RectList from "./components/sidebar/RectList.vue";
import Toolbar from "./components/sidebar/Toolbar.vue";
import { Project } from "./dtos/Project";
import { readBinaryFile, writeBinaryFile } from "@tauri-apps/api/fs";
import { save, SaveDialogOptions, open, OpenDialogOptions } from "@tauri-apps/api/dialog";
import { setTitle } from "./funcs/title";

const project = ref<Project>();

function addRect() {
  project.value?.addRect();
}

function clearRects() {
  project.value?.clearRects();
}

function removeRect() {
  project.value?.removeRect();
}

function rectGoLeft() {
  if (!project.value) return;
  const rect = project.value.selectedRect;
  if (!rect) return;
  if (rect.x - 1 >= 0) {
    rect.x -= 1;
  } else {
    rect.x = 0;
  }
}

function rectGoRight() {
  if (!project.value) return;
  const rect = project.value.selectedRect;
  if (!rect) return;
  const safeArea = project.value.safeArea;
  if (rect.x + rect.width + 1 <= safeArea.width) {
    rect.x += 1;
  } else {
    rect.x = safeArea.width - rect.width;
  }
}

function rectGoUp() {
  if (!project.value) return;
  const rect = project.value.selectedRect;
  if (!rect) return;
  if (rect.y - 1 >= 0) {
    rect.y -= 1;
  } else {
    rect.y = 0;
  }
}

function rectGoDown() {
  if (!project.value) return;
  const rect = project.value.selectedRect;
  if (!rect) return;
  const safeArea = project.value.safeArea;
  if (rect.y + rect.height + 1 <= safeArea.height) {
    rect.y += 1;
  } else {
    rect.y = safeArea.height - rect.height;
  }
}

function rectWidthExpand() {
  if (!project.value) return;
  const rect = project.value.selectedRect;
  if (!rect) return;
  const safeArea = project.value.safeArea;
  if (rect.x + rect.width + 1 <= safeArea.width) {
    rect.width += 1;
  } else {
    rect.width = safeArea.width - rect.x;
  }
}

function rectHeightExpand() {
  if (!project.value) return;
  const rect = project.value.selectedRect;
  if (!rect) return;
  const safeArea = project.value.safeArea;
  if (rect.y + rect.height + 1 <= safeArea.height) {
    rect.height += 1;
  } else {
    rect.height = safeArea.height - rect.y;
  }
}

function rectWidthShrink() {
  if (!project.value) return;
  const rect = project.value.selectedRect;
  if (!rect) return;
  if (rect.width - 1 >= 0) {
    rect.width -= 1;
  } else {
    rect.width = 1;
  }
}

function rectHeightShrink() {
  if (!project.value) return;
  const rect = project.value.selectedRect;
  if (!rect) return;
  if (rect.height - 1 >= 0) {
    rect.height -= 1;
  } else {
    rect.height = 1;
  }
}

async function createNewProject($event: string) {
  const newProject = new Project($event);
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
}

</script>

<template>
  <div class="container">
    <Sidebar>
      <template #top>
        <Toolbar @add="addRect" @remove="removeRect" @clear="clearRects" @left="rectGoLeft" @right="rectGoRight"
          @up="rectGoUp" @down="rectGoDown" @width-expand="rectWidthExpand" @width-shrink="rectWidthShrink"
          @height-expand="rectHeightExpand" @height-shrink="rectHeightShrink" />
        <RectList :rects="project?.rects" :selected="project?.selectedRectId"
          @select="$event => project && (project.selectedRectId = $event)" />
      </template>
      <template #bottom>
        <Preview v-if="project" :project="project" />
        <RatioSelector v-if="project" v-model="project.ratio" />
        <!-- <input class="border-top" type="text" readonly v-model="filename"> -->
        <FileSelector @change="createNewProject" @save="saveProject" @load="loadProject" />
      </template>
    </Sidebar>

    <Panel v-if="project" :project="project"></Panel>
  </div>
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
