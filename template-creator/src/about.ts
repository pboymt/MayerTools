import './about.scss';
import { createApp } from "vue";
import "./style.scss";
import App from "./About.vue";
import 'material-symbols';
import { getCurrent, LogicalSize } from '@tauri-apps/api/window';

createApp(App).mount("#app");
// import { getCurrent, LogicalSize, PhysicalSize } from '@tauri-apps/api/window';

// console.log('a');
// document.addEventListener('DOMContentLoaded', () => {
//     console.log('b');
//     document.getElementById('close-window')?.addEventListener('click', () => {
//         console.log('c');
//         getCurrent().hide();
//     });
// });

window.addEventListener('resize', () => {
    const { innerHeight, innerWidth } = window;
    if (innerHeight > 400 || innerWidth > 500) {
        getCurrent().setSize(new LogicalSize(500, 400));
    }
});

