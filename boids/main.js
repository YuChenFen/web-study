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
});

// 创建Boids群体
const boids = [];
const boidsCount = 300;

for (let i = 0; i < boidsCount; i++) {
    boids.push(new Boid(canvas));
}

const mouse = { x: 0, y: 0 };
canvas.addEventListener('mousemove', function (e) {
    const rect = canvas.getBoundingClientRect();
    const cx = (e.clientX - rect.left) * dpr;
    const cy = (e.clientY - rect.top) * dpr;
    mouse.x = cx;
    mouse.y = cy;
});

function animate() {
    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 更新并绘制所有Boid
    for (const boid of boids) {
        boid.flock(boids, mouse);
        boid.update();
        boid.draw();
    }

    requestAnimationFrame(animate);
}

animate();
