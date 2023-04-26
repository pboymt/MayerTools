import './about.scss';
import { createApp } from "vue";
import "./style.scss";
import App from "./About.vue";
import 'material-symbols';
import { getCurrent, LogicalSize } from '@tauri-apps/api/window';

createApp(App).mount("#app");
