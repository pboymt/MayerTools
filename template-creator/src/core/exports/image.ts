import { WebviewWindow } from '@tauri-apps/api/window';
import { DrawableProject } from '@/interfaces/Drawable';

export function exportImage(image: ImageBitmap, drawable: DrawableProject) {
    const layer0 = document.createElement('canvas');
    layer0.width = image.width;
    layer0.height = image.height;
    const layer1 = document.createElement('canvas');
    layer1.width = image.width;
    layer1.height = image.height;
    const ctx0 = layer0.getContext('2d')!;
    const ctx1 = layer1.getContext('2d')!;
    ctx0.drawImage(image, 0, 0);
    // draw warning strip in layer1
    const pattern = drawWarningStrip(ctx1);
    ctx1.fillStyle = pattern;
    ctx1.fillRect(0, 0, layer1.width, layer1.height);
    ctx1.clearRect(drawable.bounds.x, drawable.bounds.y, drawable.bounds.width, drawable.bounds.height);
    ctx1.fillStyle = 'rgba(255, 255, 255, 0.5)';
    // draw layer1 on layer0
    ctx0.drawImage(layer1, 0, 0);
    // export to data url and open in webview
    const dataURL = layer0.toDataURL('image/png');
    console.log(dataURL);
    openExportedImage(dataURL);
}

export async function openExportedImage(dataURL: string) {
    let webview: WebviewWindow;
    try {
        webview = WebviewWindow.getByLabel('export-image')!;
        if (!webview) {
            throw new Error('webview not found');
        }
        webview.emit('export-load', { dataURL });
    } catch (error) {
        webview = new WebviewWindow('export-image', {
            url: 'export-image.html',
            center: true,
            resizable: true,
            minHeight: 600,
            minWidth: 600,
            width: 600,
            height: 600,
            title: 'Export Image',
        });
        await webview.once('export-inited', (e) => {
            console.log('export-inited');
            WebviewWindow.getByLabel(e.windowLabel)?.emit('export-load', { dataURL });
        });
    } finally {
        webview!.setFocus();
    }
}

/**
 * 绘制倾角为 45° 的黄黑相间的警告条纹
 * @param ctx Canvas 的上下文
 * @param interval 同色条纹之间的间隔
 */
function drawWarningStrip(ctx: CanvasRenderingContext2D, interval = 100) {
    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = interval * 2;
    patternCanvas.height = interval * 2;
    const pCtx = patternCanvas.getContext('2d')!;
    pCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    pCtx.beginPath();
    pCtx.moveTo(0, 0);
    pCtx.lineTo(interval, 0);
    pCtx.lineTo(0, interval);
    pCtx.closePath();
    pCtx.fill();
    pCtx.beginPath();
    pCtx.moveTo(interval * 2, 0);
    pCtx.lineTo(0, interval * 2);
    pCtx.lineTo(interval, interval * 2);
    pCtx.lineTo(interval * 2, interval);
    pCtx.closePath();
    pCtx.fill();
    pCtx.fillStyle = 'rgba(255, 255, 0, 0.5)';
    pCtx.beginPath();
    pCtx.moveTo(0, interval);
    pCtx.lineTo(0, interval * 2);
    pCtx.lineTo(interval * 2, 0);
    pCtx.lineTo(interval, 0);
    pCtx.closePath();
    pCtx.fill();
    pCtx.beginPath();
    pCtx.moveTo(interval, interval * 2);
    pCtx.lineTo(interval * 2, interval * 2);
    pCtx.lineTo(interval * 2, interval);
    pCtx.closePath();
    pCtx.fill();
    return ctx.createPattern(patternCanvas, 'repeat')!;
}