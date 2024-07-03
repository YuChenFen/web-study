const canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.backgroundColor = "#202020";
document.body.appendChild(canvas);

const ctx2d = canvas.getContext('2d');
let drawable = false;

function initCtx(ctx) {
    if (ctx) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(1, -1);
        drawable = true;
    }
};
initCtx(ctx2d);

// 测试
const points = [];  // 轨迹线
const pssine = [];  // 摆线
const pssineColors = [];    // 摆线颜色
let circleCounts = 30;    // 圆圈个数
let pathDelta = 0.5;   // 采样间隔
let scale = 20;   // 图片缩放
let showPathPoints = true; // 是否显示源点集
let showCircles = true; // 是否显示圆圈
let showVector = true;  // 是否显示向量
let showPoints = true;  // 是否显示轨迹线
let showPssine = true;

function draw(ctx, idx = 0) {
    if (!ctx) {
        return;
    }
    for (let i = 0; i < pathCircles.length; i++) {
        let delta = window.innerWidth / 2 - 500;
        let x = 0;
        let y = 0;
        pathCircles[i].forEach((c) => {
            if (showCircles) {
                drawCircle(ctx, x, y, c.r);
            }
            const st = { x, y };
            x += c.r * Math.cos(((c.omega * idx * Math.PI) / 180) + c.varphi);
            y += c.r * Math.sin(((c.omega * idx * Math.PI) / 180) + c.varphi);
            const sp = { x, y };
            if (showVector) {
                drawVector(ctx, st, sp);
            }
        });
        points[i].push(x);
        points[i].push(y);
        if (points[i].length > canvas.height * canvas.width * 2) {
            points[i].shift();
            points[i].shift();
        }
        if (showPoints) {
            drawSolve(ctx, points[i]);
        }
        pssine[i].unshift(y);
        if (pssine[i].length > canvas.height * canvas.width) {
            pssine[i].pop();
        }
        const pp = [];
        pssine[i].forEach((p, i) => {
            pp.push(i / 2 + delta);
            pp.push(p);
        });
        if (showPssine) {
            
            drawSolve(ctx, pp, null, pssineColors[i]);
            drawLink(ctx, { x, y }, { x: delta, y });
        }
    }
}
const pathCircles = [];
let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13.09 10.91"><path class="cls-1" d="M9.24,.04c-.61,.11-1.12,.3-1.55,.59l-.44,.36-.69,.69C5.56,.92,5.13,0,3.29,.02l-.78,.13c-.66,.2-1.3,.59-1.68,1.07-.23,.28-.45,.63-.59,.99-.84,2.12,.61,3.45,1.6,4.43l1.72,1.7,2.12,2.1c.26,.21,.45,.56,1.01,.46,.67-.12,1.37-1.1,1.81-1.53,.83-.83,1.67-1.65,2.5-2.48,.77-.77,1.64-1.41,1.97-2.62C13.61,1.97,11.48-.35,9.24,.04h0"></path></svg>`;
let pathPoints = getPathPoints(svg, scale, pathDelta);

function cleanCanvas() {
    points.length = 0;
    pssine.length = 0;
    pssineColors.length = 0;
    pathCircles.length = 0;
}
function getCircles() {
    cleanCanvas();
    let fx = [];
    for (let i = 0; i < pathPoints.length; i++) {
        let x = [];
        for (let j = 0; j < pathPoints[i].length; j++) {
            x.push(new Complex(pathPoints[i][j].x, pathPoints[i][j].y));
        }
        fx.push(x);
    }
    let fourierSeries = new FourierSeries();
    let ak = [];
    for (let i = 0; i < fx.length; i++) {
        ak.push(fourierSeries.get_ak(fx[i], circleCounts, 1));
    }
    for (let i = 0; i < ak.length; i++) {
        circles = [];
        for (let j = 0; j < ak[i].length; j++) {
            let r = Math.hypot(ak[i][j].real, ak[i][j].imag);
            let omega = (1 + j >> 1) * (j & 1 ? -1 : 1);
            let varphi = Math.atan2(ak[i][j].imag, ak[i][j].real);
            circles.push({ r, omega, varphi });
        }
        circles.sort((a, b) => b.r - a.r);
        pathCircles.push(circles);
        points.push([]);
        pssine.push([]);
        pssineColors.push(getRandomColor());
    }
}
getCircles();

// 绘制
let i = 0;
(function run() {
    if (drawable) {
        drawAxis(ctx2d);
        if (showPathPoints) {
            for (let i = 0; i < pathPoints.length; i++) {
                for (let j = 0; j < pathPoints[i].length; j++) {
                    drawCircle(ctx2d, -pathPoints[i][j].x, -pathPoints[i][j].y, 1, "pink");
                }
            }
        }
        draw(ctx2d, i);
        i += 1;
    }
    return requestAnimationFrame(run);
})();



/* 事件处理 */
// 窗口大小改变
window.onresize = function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initCtx(ctx2d);
};
// 文件
let file_input = document.querySelector("#file-input");
file_input.onchange = function () {
    let file = file_input.files[0];
    if (file) {
        let reader = new FileReader();
        reader.onload = function (e) {
            svg = e.target.result;
            pathPoints = getPathPoints(svg, scale, pathDelta);
            getCircles();
        }
        reader.readAsText(file);
    }
};
// 圆圈个数
let circle_num = document.querySelector("#circle-num");
circle_num.value = circleCounts;
circle_num.onchange = function () {
    circleCounts = Number(circle_num.value);
    getCircles();
};
// 路径采样间隔
let path_delta = document.querySelector("#path-delta");
path_delta.value = pathDelta;
path_delta.onchange = function () {
    pathDelta = Number(path_delta.value);
    if (pathDelta < 0.01) {
        pathDelta = 0.01;
        path_delta.value = pathDelta;
    }
    pathPoints = getPathPoints(svg, scale, pathDelta);
    getCircles();
};
// 路径缩放
let path_scale = document.querySelector("#path-scale");
path_scale.value = scale;
path_scale.onchange = function () {
    scale = Number(path_scale.value);
    pathPoints = getPathPoints(svg, scale, pathDelta);
    getCircles();
};
// 显示源点集
let show_path_points = document.querySelector("#show-path-points");
show_path_points.checked = showPathPoints;
show_path_points.onchange = function () {
    showPathPoints = show_path_points.checked;
};
// 显示圆圈
let show_circles = document.querySelector("#show-circles");
show_circles.checked = showCircles;
show_circles.onchange = function () {
    showCircles = show_circles.checked;
};
// 显示向量
let show_vector = document.querySelector("#show-vector");
show_vector.checked = showVector;
show_vector.onchange = function () {
    showVector = show_vector.checked;
};
// 显示轨迹
let show_points = document.querySelector("#show-points");
show_points.checked = showPoints;
show_points.onchange = function () {
    showPoints = show_points.checked;
};
// 显示时域
let show_pssine = document.querySelector("#show-pssine");
show_pssine.checked = showPssine;
show_pssine.onchange = function () {
    showPssine = show_pssine.checked;
};