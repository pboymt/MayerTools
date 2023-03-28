import { open } from "@tauri-apps/api/dialog";

export async function selectFile() {
    const result = await open({
        multiple: false,
        filters: [{
            name: 'Image',
            extensions: ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp']
        }]
    });
    if (typeof result === 'string' && result.length > 0) {
        return result;
    } else {
        return null;
    }
}