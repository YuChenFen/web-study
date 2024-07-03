function drawAxis(ctx) {
    if (ctx) {
        ctx.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.strokeStyle = '#ffffff20';
        ctx.lineWidth = 1;
        ctx.moveTo(0, 0);
        ctx.lineTo(canvas.width / 2 - 10, 0);
        ctx.moveTo(0, 0);
        ctx.lineTo(0, canvas.height / 2 - 10);
        ctx.moveTo(0, 0);
        ctx.lineTo(-canvas.width / 2 + 10, 0);
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -canvas.height / 2 + 10);
        ctx.stroke();
    }
};

function drawCircle(ctx, x, y, r, color = "#ff0000") {
    if (ctx) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.stroke();
    }
};

function drawVector(ctx, st, sp) {
    const theta = (20 * Math.PI) / 180;
    const delta = 10;
    if (ctx) {
        ctx.strokeStyle = "#ff00ff";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(st.x, st.y);
        ctx.lineTo(sp.x, sp.y);
        const alpha = Math.atan2(sp.y - st.y, sp.x - st.x);
        const phi1 = Math.PI / 2 - alpha - theta;
        const phi2 = alpha - theta;
        const p1 = {
            x: sp.x - delta * Math.sin(phi1),
            y: sp.y - delta * Math.cos(phi1)
        }
        const p2 = {
            x: sp.x - delta * Math.cos(phi2),
            y: sp.y - delta * Math.sin(phi2)
        }
        ctx.moveTo(sp.x, sp.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.moveTo(sp.x, sp.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
    }
};

function drawLink(ctx, p1, p2) {
    ctx.beginPath();
    ctx.strokeStyle = "#ffff00";
    ctx.setLineDash([5, 5]);
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawSolve(ctx, data, k = null, color = null) {
    if (!ctx) {
        return;
    }
    k = k || 1;
    let size = data.length;
    let last = size - 4;
    ctx.strokeStyle = color || "#fff0f0";
    ctx.beginPath();
    ctx.moveTo(data[0], data[1]);
    for (let i = 0; i < size - 2; i += 2) {
        let x0 = i ? data[i - 2] : data[0];
        let y0 = i ? data[i - 1] : data[1];
        let x1 = data[i];
        let y1 = data[i + 1];
        let x2 = data[i + 2];
        let y2 = data[i + 3];
        let x3 = i < last ? data[i + 4] : x2;
        let y3 = i < last ? data[i + 5] : y2;
        let cp1x = x1 + ((x2 - x0) / 6) * k;
        let cp1y = y1 + ((y2 - y0) / 6) * k;
        let cp2x = x2 - ((x3 - x1) / 6) * k;
        let cp2y = y2 - ((y3 - y1) / 6) * k;
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x2, y2);
    }
    ctx.stroke();
}