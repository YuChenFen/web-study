// 尝试窗口通信
const pageId = `screen-XYWH-${Math.random().toString(36).substring(2)}`; // 生成一个随机的页面ID
let pages = new Set();
// 移除所有值
for(let i = 0, len = localStorage.length; i < len; i++){
    let key = localStorage.key(i)
    if(/^screen-XYWH-/.test(key)){
        localStorage.removeItem(key);
    }
}

window.addEventListener("storage", (e) => {
    if (e.key !== pageId) {
        if (!pages.has(e.key)) {
            pages.add(e.key);
        }
        if (e.newValue) {
            let { x, y, width, height } = JSON.parse(e.newValue);
            // console.log(x, y, width, height);
            draw(x, y, width, height, true);
        } else {
            pages.delete(e.key);
            draw(0, 0, 0, 0, false);
        }
    }
});

function setScreen() {
    // if(localStorage.getItem(pageId)){
    //     let { x, y, width, height } = JSON.parse(localStorage.getItem(pageId));
    //     if(x === window.screenX && y === window.screenY && width === window.innerWidth && height === window.innerHeight){
    //         return;
    //     }
    // }
    localStorage.setItem(pageId, JSON.stringify({
        x: window.screenX,
        y: window.screenY,
        width: window.innerWidth,
        height: window.innerHeight
    }))
    for (let page of pages) {
        let { x, y, width, height } = JSON.parse(localStorage.getItem(page));
        draw(x, y, width, height, true);
    }
}

function step() {
    setScreen();
    requestAnimationFrame(step);
}

window.addEventListener("beforeunload", (event) => {
    cancelAnimationFrame(step);
    // 连续刷新可能无法执行，所以需要在启动一个新页面时将所有数据清空
    localStorage.removeItem(pageId);
});
step();


let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let x = window.innerWidth / 2;
let y = window.innerHeight / 2;
const draw = (nx, ny, nw, nh, flag) => {
    x = window.innerWidth / 2;
    y = window.innerHeight / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(x, y, 100, 0, 2 * Math.PI, true);
    ctx.stroke();
    if (flag) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(nx - window.screenX + (nw / 2), ny - window.screenY + (nh / 2));
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(nx - window.screenX + (nw / 2), ny - window.screenY + (nh / 2), 100, 0, 2 * Math.PI, true);
        ctx.stroke();
    }
}
draw()