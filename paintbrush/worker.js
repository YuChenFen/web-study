let canvas;
let ctx;

function draw(instance, index) {
    if(index === 0){
        ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
    ctx.save()
    ctx.lineCap = 'round'
    // ctx.lineJoin = 'round'
    const color = '#000000'
    ctx.strokeStyle = color;
    // ctx.shadowBlur = 5;
    // ctx.shadowColor = color;
    for(let i = 1; i < instance.positions.length; i++){
        drawBasic(instance, i)
    }
    ctx.restore()
}

function drawBasic(instance, i) {
    const { positions, lineWidths } = instance
    const { x: centerX, y: centerY } = positions[i - 1]
    const { x: endX, y: endY } = positions[i]
    ctx.beginPath()
    if (i == 1) {
        ctx.moveTo(centerX, centerY)
        ctx.lineTo(endX, endY)
    } else {
        const { x: startX, y: startY } = positions[i - 2]
        const lastX = (startX + centerX) / 2
        const lastY = (startY + centerY) / 2
        const x = (centerX + endX) / 2
        const y = (centerY + endY) / 2
        ctx.moveTo(lastX, lastY)
        ctx.quadraticCurveTo(centerX, centerY, x, y)
    }
    
    ctx.lineWidth = lineWidths[i]
    ctx.stroke()
}

this.onmessage = function({ data }) {
    switch(data.type){
        case 'init':
            canvas = data.canvas
            ctx = canvas.getContext('2d')
            break
        case 'draw':
            draw({
                positions: data.positions,
                lineWidths: data.lineWidths
            }, data.index)
            break
        default:
            break
    }
};
