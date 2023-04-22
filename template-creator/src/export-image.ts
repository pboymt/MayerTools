import { createApp } from "vue";
import "./style.scss";
import App from "./Export.vue";
import 'material-symbols';
import { getCurrent, LogicalSize } from '@tauri-apps/api/window';

createApp(App).mount("#app");