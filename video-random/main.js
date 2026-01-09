const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// 设置画布尺寸
function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    
    ctx.scale(dpr, dpr);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Box {
    constructor(x, y, boxSize = 10) {
        this.x = x;
        this.y = y;
        this.boxSize = boxSize;
        this.value = Math.random() > 0.5;
    }

    setValue(value) {
        this.value = value;
        return this;
    }

    draw() {
        ctx.fillStyle = this.value ? "#000000" : "#ffffff";
        ctx.fillRect(this.x, this.y, this.boxSize, this.boxSize);
    }

    reverse() {
        this.value = !this.value;
        this.draw();
        return this;
    }
}

// 配置数据
const dataConfig = {
    size: 10,
    reverseFlag: '黑',
    
    async uploadVideo() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'video/*';
        fileInput.style.display = 'none';

        fileInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const video = document.createElement('video');
            video.muted = true;
            video.playsInline = true;
            
            const videoUrl = URL.createObjectURL(file);
            video.src = videoUrl;
            
            video.onloadedmetadata = () => {
                videoProcessor.processVideo(video);
            };
            
            video.onended = () => {
                URL.revokeObjectURL(videoUrl);
            };
            
            video.onerror = () => {
                URL.revokeObjectURL(videoUrl);
                console.error('视频加载失败');
            };
            
            await video.play().catch(console.error);
        };

        document.body.appendChild(fileInput);
        fileInput.click();
        setTimeout(() => {
            document.body.removeChild(fileInput);
        }, 100);
    }
};

// 视频处理控制器
class VideoProcessor {
    constructor() {
        this.isProcessing = false;
        this.currentVideo = null;
        this.currentReader = null;
        this.currentStream = null;
    }

    async processVideo(videoElement) {
        // 停止当前正在处理的视频
        this.stopProcessing();
        
        this.isProcessing = true;
        this.currentVideo = videoElement;
        
        try {
            const stream = videoElement.captureStream();
            this.currentStream = stream;
            const videoTrack = stream.getVideoTracks()[0];
            const processor = new MediaStreamTrackProcessor({ track: videoTrack });
            const reader = processor.readable.getReader();
            this.currentReader = reader;

            const dpr = window.devicePixelRatio || 1;
            const scaleFactor = dataConfig.size;

            while (this.isProcessing) {
                const { done, value: videoFrame } = await reader.read();
                if (done) break;

                // 计算适合画布的尺寸
                const targetWidth = Math.floor(canvas.width / dpr / scaleFactor);
                const targetHeight = Math.floor(canvas.height / dpr / scaleFactor);
                
                // 创建离屏canvas处理视频帧
                const offscreenCanvas = new OffscreenCanvas(targetWidth, targetHeight);
                const offscreenCtx = offscreenCanvas.getContext('2d', { willReadFrequently: true });
                
                offscreenCtx.drawImage(videoFrame, 0, 0, targetWidth, targetHeight);
                const imageData = offscreenCtx.getImageData(0, 0, targetWidth, targetHeight);
                
                // 处理像素数据
                this.processFrame(imageData, targetWidth, targetHeight);
                
                videoFrame.close();
                
                // 添加延迟防止阻塞UI
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        } catch (error) {
            if (this.isProcessing) {
                console.error('视频处理错误:', error);
            }
        } finally {
            this.cleanup();
        }
    }

    processFrame(imageData, width, height) {
        const data = imageData.data;
        const reverseFlag = dataConfig.reverseFlag;
        const isBlack = reverseFlag === '黑';
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // 计算对应的网格位置
            const pixelIndex = i / 4;
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            
            // 计算灰度值
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            
            // 根据条件反转方块
            const shouldReverse = (isBlack && gray < 128) || (!isBlack && gray > 128);
            
            if (shouldReverse) {
                const box = boxMap.get(`${x}:${y}`);
                if (box) box.reverse();
            }
        }
    }

    stopProcessing() {
        this.isProcessing = false;
        
        // 停止视频播放
        if (this.currentVideo) {
            this.currentVideo.pause();
            this.currentVideo.src = '';
        }
        
        // 取消reader
        if (this.currentReader) {
            this.currentReader.cancel().catch(() => {});
        }
        
        // 停止所有媒体流轨道
        if (this.currentStream) {
            this.currentStream.getTracks().forEach(track => track.stop());
        }
        
        this.cleanup();
    }

    cleanup() {
        this.currentVideo = null;
        this.currentReader = null;
        this.currentStream = null;
    }
}

// 初始化视频处理器
const videoProcessor = new VideoProcessor();

// 存储Box对象的Map
const boxMap = new Map();

// 初始化画布
function initCanvas() {
    boxMap.clear();
    const dpr = window.devicePixelRatio || 1;
    const cols = Math.floor(canvas.width / dpr / dataConfig.size);
    const rows = Math.floor(canvas.height / dpr / dataConfig.size);
    
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            const boxX = x * dataConfig.size;
            const boxY = y * dataConfig.size;
            const box = new Box(boxX, boxY, dataConfig.size);
            boxMap.set(`${x}:${y}`, box);
            box.draw();
        }
    }
}

// 重新绘制画布（调整方块大小时调用）
function redrawCanvas() {
    initCanvas();
}

// 初始化
initCanvas();

// GUI控制器
const gui = new lil.GUI({ title: '控制器' });
gui.add(dataConfig, 'size', 1, 20, 1)
    .name('方块大小')
    .onChange(() => {
        videoProcessor.stopProcessing();
        redrawCanvas();
    });
    
gui.add(dataConfig, 'reverseFlag', ['黑', '白'])
    .name('方块反转');

gui.add(dataConfig, 'uploadVideo')
    .name('上传视频');

// 页面卸载时清理资源
window.addEventListener('beforeunload', () => {
    videoProcessor.stopProcessing();
});