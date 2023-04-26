import { Template, Template_RegionOfInterest_Anchor, Template_ScreenRatio } from "@/dtos/export";
import { Project } from "@/interfaces/Project";
import { BaseDirectory, writeBinaryFile } from "@tauri-apps/api/fs";

export async function exportMTTPL(image: ImageBitmap, project: Project) {
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
        const filename = `${project.name}-${roi.name}.mttpl`;
        const proto = Template.toBinary({
            version: 1,
            name: project.name,
            width: width,
            height: height,
            image: uint8array,
            screenRatio: project.ratio as unknown as Template_ScreenRatio,
            screenHeight: project.screenHeight,
            screenWidth: project.screenWidth,
            roi: {
                x: roi.x,
                y: roi.y,
                width: roi.width,
                height: roi.height,
                anchor: roi.anchor as unknown as Template_RegionOfInterest_Anchor,
            }
        })
        await writeBinaryFile(filename, proto, { dir: BaseDirectory.Download });
        console.log(`exported ${filename}`);
    }
}