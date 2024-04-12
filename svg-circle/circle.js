const svg = document.querySelector('#circle-svg');
let animateDuration = 500;

// 更新当前的圆
function updateCircle(e) {
    let index = Array.from(svg.children).indexOf(e.target);
    let cx = Number(e.target.getAttribute('cx'));
    let cy = Number(e.target.getAttribute('cy'));
    let r = Number(e.target.getAttribute('r'));
    if (r <= 2) {
        return;
    }
    // 删除掉该元素
    svg.children[index].remove();
    let dr = r / 2;
    let circlesObj = [{
        cx: cx - dr,
        cy: cy - dr,
        r: dr
    }, {
        cx: cx - dr,
        cy: cy + dr,
        r: dr
    }, {
        cx: cx + dr,
        cy: cy - dr,
        r: dr
    }, {
        cx: cx + dr,
        cy: cy + dr,
        r: dr
    }];
    let animates = [{
        transformOrigin: `${cx - r}px ${cy - r}px`,
        x: 0, y: 0
    }, {
        transformOrigin: `${cx - r}px ${cy}px`,
        x: 0, y: -1 * r
    }, {
        transformOrigin: `${cx}px ${cy - r}px`,
        x: -1 * r, y: 0
    }, {
        transformOrigin: `${cx}px ${cy}px`,
        x: -1 * r, y: -1 * r
    }]
    // 创建四个新的元素
    for (let i = 0; i < 4; i++) {
        let circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', circlesObj[i].cx);
        circle.setAttribute('cy', circlesObj[i].cy);
        circle.setAttribute('r', circlesObj[i].r);
        circle.setAttribute('fill', getColor(circlesObj[i].cx - dr, circlesObj[i].cy - dr, 2 * dr, 2 * dr));

        svg.appendChild(circle);
        let player = circle.animate([
            {
                transformOrigin: animates[i].transformOrigin,
                transform: `translate(${animates[i].x}px, ${animates[i].y}px) scale(2)`,
                opacity: 0.25
            },
            {
                transformOrigin: animates[i].transformOrigin,
                transform: 'none',
                opacity: 1
            }
        ], {
            duration: animateDuration,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        });
        player.onfinish = () => {
            circle.addEventListener('mousemove', updateCircle, {once: true});
        };
    }

}

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 512;
canvas.height = 512;

const img = new Image();
img.onload = function () {
    ctx.drawImage(img, 0, 0, 512, 512);
    let circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', 256);
    circle.setAttribute('cy', 256);
    circle.setAttribute('r', 256);
    circle.setAttribute('fill', getColor(0, 0, 512, 512));
    svg.appendChild(circle);
    let player = circle.animate([
        {
            transformOrigin: '256px 256px',
            transform: 'scale(0)',
            opacity: 0
        },
        {
            transformOrigin: '256px 256px',
            transform: 'scale(1)',
            opacity: 1
        }
    ], {
        duration: animateDuration,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    });
    player.onfinish = () => {
        circle.addEventListener('mousemove', updateCircle);
    };
};
// img.crossOrigin = "Anonymous";
img.src = './circle.png';

// 获取该区域的平均颜色
function getColor(x, y, w, h) {
    let imgData = ctx.getImageData(x, y, w, h);
    let data = imgData.data;
    let r = 0, g = 0, b = 0;
    for (let i = 0, len = data.length; i < len; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
    }
    // 转为16进制
    r = Math.floor(r / (w * h));
    g = Math.floor(g / (w * h));
    b = Math.floor(b / (w * h));
    return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
}
