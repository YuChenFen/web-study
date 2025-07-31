class Particle {
    constructor(x, y, canvas) {
        this.ctx = canvas.getContext('2d');
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.baseX = x;
        this.baseY = y;
        this.vx = 0;
        this.vy = 0;
        this.size = 1;
        this.color = {
            r: Math.random() * 255,
            g: Math.random() * 255,
            b: Math.random() * 255
        };
        this.baseColor = {
            r: Math.random() * 255,
            g: Math.random() * 255,
            b: Math.random() * 255
        };
        this.vColor = { r: 0, g: 0, b: 0 }
        this.alpha = 1.0;
        this.baseAlpha = 0.5;
        this.vAlpha = 0.0;
        this.elasticityFactor = 0.05;
    }

    update(mouse) {
        let dx = this.baseX - this.x;
        let dy = this.baseY - this.y;
        this.vx += dx * this.elasticityFactor;
        this.vy += dy * this.elasticityFactor;

        // 鼠标事件
        if (mouse.speed) {
            let mx = mouse.x;
            let my = mouse.y;
            // 当前点到鼠标点距离平方
            let dist = (this.x - mx) * (this.x - mx) + (this.y - my) * (this.y - my);
            // 最小分格距离
            let minDist = 18 + Math.min(mouse.speed * 2.5, 120);
            let baseForce = Math.min(mouse.speed * 0.5, 0.25);
            // 点和鼠标之间的角度
            let angle = Math.atan2(this.y - my, this.x - mx);
            if (dist < minDist * minDist) {
                let force = (minDist - Math.sqrt(dist)) * baseForce;
                this.vx += Math.cos(angle) * force;
                this.vy += Math.sin(angle) * force;
            }
        }

        this.vx *= 0.6;
        this.vy *= 0.6;
        this.x += this.vx;
        this.y += this.vy;

        // 颜色
        this.vColor.r += (this.baseColor.r - this.color.r) * this.elasticityFactor;
        this.vColor.g += (this.baseColor.g - this.color.g) * this.elasticityFactor;
        this.vColor.b += (this.baseColor.b - this.color.b) * this.elasticityFactor;
        this.vAlpha += (this.baseAlpha - this.alpha) * this.elasticityFactor;
        this.vColor.r *= 0.6;
        this.vColor.g *= 0.6;
        this.vColor.b *= 0.6;
        this.vAlpha *= 0.6;

        this.color.r += this.vColor.r;
        this.color.g += this.vColor.g;
        this.color.b += this.vColor.b;
        this.alpha += this.vAlpha;
    }

    draw() {
        if (this.alpha <= 0) return;
        this.ctx.fillStyle = `rgba(${this.baseColor.r}, ${this.baseColor.g}, ${this.baseColor.b}, ${this.baseAlpha})`;
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        this.ctx.fill();
    }
}