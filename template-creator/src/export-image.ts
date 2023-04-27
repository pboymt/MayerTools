import { createApp } from "vue";
import "@/style.scss";
import App from "@/Export.vue";
import 'material-symbols';

window.addEventListener("contextmenu", (e) => e.preventDefault());
createApp(App).mount("#app");