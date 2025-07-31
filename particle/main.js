// Canvas 初始化
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const dpr = window.devicePixelRatio;
canvas.width = window.innerWidth * dpr;
canvas.height = window.innerHeight * dpr;
canvas.style.width = window.innerWidth + 'px';
canvas.style.height = window.innerHeight + 'px';

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
})

let particleGap = 3;    // 采样间隔
let particles = [];     // 粒子数组

function textToParticles(text, options = {}) {
    // 设置居中
    ctx.textAlign = 'center';
    // 设置画笔
    for (const option in options) {
        ctx[option] = options[option];
    }

    // 绘制文字
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const newParticles = [];
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    for (let y = 0; y < canvas.height; y += particleGap) {
        for (let x = 0; x < canvas.width; x += particleGap) {
            let index = (y * canvas.width + x) * 4;
            let sx = x;
            let sy = y;
            if (index >= 0 && index < data.length && data[index + 3] > 128) {
                let particle = new Particle(sx, sy, canvas);
                particle.baseColor = {
                    r: data[index],
                    g: data[index + 1],
                    b: data[index + 2]
                }
                particle.baseAlpha = data[index + 3] / 255;
                newParticles.push(particle);
            }
        }
    }
    return newParticles;
}

function imageToParticles(image, options = {}) {
    // 设置画笔
    for (const option in options) {
        ctx[option] = options[option];
    }

    // 绘制图像
    const widthScale = (window.innerWidth - 30) / image.width;
    const heightScale = (window.innerHeight - 30) / image.height;
    const ratio = Math.min(widthScale, heightScale) - 0.5;
    const centerShiftX = (canvas.width - image.width * ratio) / 2;
    const centerShiftY = (canvas.height - image.height * ratio) / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, image.width, image.height, centerShiftX, centerShiftY, image.width * ratio, image.height * ratio);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const newParticles = [];
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    for (let y = 0; y < canvas.height; y += particleGap) {
        for (let x = 0; x < canvas.width; x += particleGap) {
            let index = (y * canvas.width + x) * 4;
            let sx = x;
            let sy = y;
            if (index >= 0 && index < data.length && data[index + 3] > 128) {
                let particle = new Particle(sx, sy, canvas);
                particle.baseColor = {
                    r: data[index],
                    g: data[index + 1],
                    b: data[index + 2]
                }
                particle.baseAlpha = data[index + 3] / 255;
                newParticles.push(particle);
            }
        }
    }
    return newParticles;
}

particles = textToParticles('Hello World!', {
    font: 'bold 150px Arial',
})

let mouse = { x: -1000, y: -1000, vx: 0, vy: 0, speed: 0 };
canvas.addEventListener('mousemove', function (e) {
    const rect = canvas.getBoundingClientRect();
    const cx = (e.clientX - rect.left) * dpr;
    const cy = (e.clientY - rect.top) * dpr;
    if (mouse.x < 0 || mouse.y < 0) {
        mouse.vx = 0;
        mouse.vy = 0;
        mouse.speed = 0;
    } else {
        mouse.vx = cx - mouse.x;
        mouse.vy = cy - mouse.y;
        mouse.speed = Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy);
    }
    mouse.x = cx;
    mouse.y = cy;
});

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let ps = particles;
    for (let p of ps) {
        p.update(mouse);
        p.draw();
        ctx.fill();
    }
    requestAnimationFrame(animate);
}

function smoothTransitionToParticles(newParticles) {
    const currentParticles = particles;
    const currentCount = currentParticles.length;
    const newCount = newParticles.length;

    const particlesToReuse = Math.min(currentCount, newCount);
    // 乱序
    currentParticles.sort(() => Math.random() - 0.5)
    for (let i = 0; i < particlesToReuse; i++) {
        const currentParticle = currentParticles[i];
        const newParticle = newParticles[i];
        currentParticle.baseX = newParticle.baseX;
        currentParticle.baseY = newParticle.baseY;
        currentParticle.size = newParticle.size;
        currentParticle.baseColor = newParticle.baseColor;
        currentParticle.baseAlpha = newParticle.baseAlpha;
    }

    for (let i = particlesToReuse; i < currentCount; i++) {
        currentParticles[i].baseAlpha = 0;
    }

    for (let i = particlesToReuse; i < newCount; i++) {
        const newParticle = newParticles[i];
        particles.push(newParticle);
    }

    setTimeout(() => {
        const currentParticles = particles;
        for (let i = currentParticles.length - 1; i >= 0; i--) {
            if (currentParticles[i].alpha <= 0) {
                currentParticles.splice(i, 1);
            }
        }
    }, 500);
}


setTimeout(() => {
    let newParticles = textToParticles('你好，世界！');
    smoothTransitionToParticles(newParticles)
}, 3000);

setTimeout(() => {
    const image = new Image();
    image.src = imageBase64;
    image.onload = () => {
        const newParticles = imageToParticles(image);
        smoothTransitionToParticles(newParticles)
    };
}, 6000);


animate();