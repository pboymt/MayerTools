import { appWindow } from "@tauri-apps/api/window";

export function setTitle(name?: string, filename = '*') {
    let title = "Mayer Template Creator";
    if (name) {
        title += ` - ${name}`;
        if (filename) {
            title += ` - ${filename}`;
        }
    }
    appWindow.setTitle(title);
}