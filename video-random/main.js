const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.style.width = window.innerWidth + "px";
canvas.style.width = window.innerWidth + "px";
canvas.width = window.innerWidth * window.devicePixelRatio;
canvas.height = window.innerHeight * window.devicePixelRatio;

class Box {
    x;
    y;
    value = false;
    boxSize = 10;
    constructor(x, y, boxSize) {
        this.x = x;
        this.y = y;
        if (boxSize && boxSize > 0) {
            this.boxSize = boxSize;
        }
        return this;
    }

    setValue(value) {
        this.value = value;
        return this;
    }

    draw() {
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.boxSize, this.boxSize);
        ctx.fillStyle = this.value ? "#000000" : "#ffffff";
        ctx.fill();
        ctx.closePath();
    }

    reverse() {
        this.value = !this.value;
        this.draw();
        return this;
    }
}

/**
 * ============ 视频提取 =====================
 */
async function extractFramesWithWebCodecs(videoElement) {
    const stream = videoElement.captureStream();
    const videoTrack = stream.getVideoTracks()[0];
    const processor = new MediaStreamTrackProcessor({ track: videoTrack });
    const reader = processor.readable.getReader();

    const frames = [];

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // value 是一个 VideoFrame 对象
        const bitmap = await createImageBitmap(value, {
            resizeWidth: maxWidth,
            resizeHeight: maxHeight,
            resizeQuality: 'high'
        });
        const canvasVideo = document.createElement('canvas');
        const ctxVideo = canvasVideo.getContext('2d');

        canvasVideo.width = value.displayWidth;
        canvasVideo.height = value.displayHeight;
        ctxVideo.drawImage(bitmap, 0, 0);
        // 转为像素数组
        const imageData = ctxVideo.getImageData(0, 0, canvasVideo.width, canvasVideo.height);

        for(let i = 0; i < imageData.data.length; i += 4){
            const r = imageData.data[i];
            const g = imageData.data[i + 1];
            const b = imageData.data[i + 2];
            // const a = imageData.data[i + 3];

            const x = i / 4 % canvasVideo.width;
            const y = Math.floor(i / 4 / canvasVideo.width);

            const gray = (r + g + b) / 3;
            if(data.reverseFlag === '黑' && gray < 128){
                boxMap.get(x + ":" + y)?.reverse();
            }else if(data.reverseFlag === '白' && gray > 128){
                boxMap.get(x + ":" + y)?.reverse();
            }
        }

        value.close();
        bitmap.close();
    }
}

const data = {
    size: 10,
    reverseFlag: '黑',
    uploadVideo() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'video/*';
        fileInput.style.display = 'none';

        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const video = document.createElement('video');
                video.src = URL.createObjectURL(file);
                video.onloadedmetadata = () => {
                    extractFramesWithWebCodecs(video);
                };
                video.load();
                video.play();
            }
        };

        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
    }
}

const boxMap = new Map();
let maxWidth = 0;
let maxHeight = 0;

function drawCanvas() {
    boxMap.clear();
    for (let i = 0; i < canvas.width / data.size; i += 1) {
        for (let j = 0; j < canvas.height / data.size; j += 1) {
            const value = Math.random() > 0.5;
            const box = new Box(i * data.size, j * data.size, data.size);
            boxMap.set(i + ":" + j, box);
            box.setValue(value).draw();
            maxWidth = i;
            maxHeight = j;
        }
    }
}
drawCanvas();

/**
 * ============ 调值控件 =====================
 */
const GUI = lil.GUI;

const gui = new GUI({ title: '控制器' });
gui.add(data, 'size', 1, 10, 1).name('方块大小').onChange(drawCanvas)
gui.add(data, 'reverseFlag', ['黑', '白']).name('方块反转');
gui.add(data, 'uploadVideo').name('上传视频');
