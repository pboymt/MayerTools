import { Project } from "@/interfaces/Project";
import { BaseDirectory, writeBinaryFile, writeTextFile } from "@tauri-apps/api/fs";

export interface JSONMetadata {
    version: number;
    name: string;
    width: number;
    height: number;
    screenRatio: number;
    screenHeight: number;
    screenWidth: number;
    roi: {
        x: number;
        y: number;
        width: number;
        height: number;
        anchor: number;
    }
}

export async function exportJSON(image: ImageBitmap, project: Project) {
    for (const [uuid, roi] of project.rois) {
        const { x, y, width, height } = roi.rect.bounds;
        const tpl = document.createElement('canvas');
        tpl.width = width;
        tpl.height = height;
        const ctx = tpl.getContext('2d')!;
        ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
        // convert canvas to binary file as uint8array
        const uint8array = await new Promise<Uint8Array>(resolve => {
            tpl.toBlob(blob => {
                const reader = new FileReader();
                reader.onload = () => {
                    const arrayBuffer = reader.result as ArrayBuffer;
                    const uint8array = new Uint8Array(arrayBuffer);
                    resolve(uint8array);
                };
                reader.readAsArrayBuffer(blob!);
            });
        });
        // write binary file
        const tplname = `${project.name}-${roi.name}.png`;
        const jsonname = `${project.name}-${roi.name}.json`;
        const metadata: JSONMetadata = {
            version: 1,
            name: project.name,
            width: width,
            height: height,
            screenRatio: project.ratio,
            screenHeight: project.screenHeight,
            screenWidth: project.screenWidth,
            roi: {
                x: roi.x,
                y: roi.y,
                width: roi.width,
                height: roi.height,
                anchor: roi.anchor,
            }
        }
        await writeBinaryFile(tplname, uint8array, { dir: BaseDirectory.Download });
        console.log(`exported ${tplname}`);
        await writeTextFile(jsonname, JSON.stringify(metadata), { dir: BaseDirectory.Download });
        console.log(`exported ${jsonname}`);
    }
}