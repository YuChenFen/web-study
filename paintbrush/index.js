function getDistance(start, end) {
    return Math.sqrt(Math.pow(start.x - end.x, 2) + Math.pow(start.y - end.y, 2));
}

class Paintbrush {
    constructor(canvas) {
        this.canvas = canvas;
        this.current = -1; 
        this.positions = [];
        this.lineWidths = [];
        this.lastMoveTime = Date.now();
        this.minWidth = 3
        this.maxWidth = 8
        this.lastLineWidth = 5
        this.maxSpeed = 10
        this.minSpeed = 5
        this.init()
        this.isDrawing = false
        this.worker = new Worker('./worker.js')
        const offscreenCanvas = this.canvas.transferControlToOffscreen()
        this.worker.postMessage({
            type: 'init',
            canvas: offscreenCanvas,
        }, [offscreenCanvas])
    }

    init(){
        this.canvas.addEventListener('mousemove', (e) => {
            if(!this.isDrawing){
                return
            }
            const { offsetX, offsetY } = e

            this.addPosition({ 
                x: offsetX * window.devicePixelRatio, 
                y: offsetY * window.devicePixelRatio, 
            })
            this.draw()
        })
        this.canvas.addEventListener('mousedown', (e) => {
            this.isDrawing = true;
            this.positions.push([]);
            this.lineWidths.push([])
            this.current += 1;
            // this.addPosition({ 
            //     x: e.offsetX * window.devicePixelRatio, 
            //     y: e.offsetY * window.devicePixelRatio, 
            // });
        })
        this.canvas.addEventListener('mouseup', (e) => {
            this.isDrawing = false;
        })
    }

    /**
     * 鼠标移动时添加新坐标
     * @param {object} position
     */
    addPosition(position) {
        if(this.current < 0){
            return
        }
        this.positions[this.current].push(position);
        if(this.positions[this.current].length > 1){
            const mouseSpeed = this._computedSpeed(
                this.positions[this.current][this.positions[this.current].length - 2],
                this.positions[this.current][this.positions[this.current].length - 1]
            )
            const lineWidth = this._computedLineWidth(mouseSpeed)
            this.lineWidths[this.current].push(lineWidth)
        }
        setTimeout(() => {
            this.clearLast()
            this.draw()
        }, 2500)
    }

    /**
     * 计算移动速度
     * @param {object} start
     * @param {object} end
     */
    _computedSpeed(start, end) {
        const moveDistance = getDistance(start, end)
        const curTime = Date.now()
        const moveTime = curTime - this.lastMoveTime
        const mouseSpeed = moveDistance / moveTime
        this.lastMoveTime = curTime
        return mouseSpeed
    }

    /**
     * 根据速度计算线宽
     * @param {number} speed
     */
    _computedLineWidth(speed) {
        let lineWidth = 0
        const minWidth = this.minWidth
        const maxWidth = this.maxWidth
        if (speed >= this.maxSpeed) {
            lineWidth = minWidth
        } else if (speed <= this.minSpeed) {
            lineWidth = maxWidth
        } else {
            lineWidth = maxWidth - (speed / this.maxSpeed) * maxWidth
        }

        lineWidth = lineWidth * (1 / 3) + this.lastLineWidth * (2 / 3)
        this.lastLineWidth = lineWidth
        return lineWidth
    }

    /**
     * 绘制
     */
    draw() {
        for(let i = 0; i < this.positions.length; i++){
            this.worker.postMessage({
                type: 'draw',
                index: i,
                positions: this.positions[i],
                lineWidths: this.lineWidths[i],
            })
        }
    }

    /**
     * 消除末尾
     */
    clearLast() {
        if(this.positions.length > 0){
            this.positions[0].shift()
            this.lineWidths[0].shift()
            if(this.positions[0].length === 0){
                this.positions.shift()
                this.lineWidths.shift()
                this.current -= 1
            }
        }
    }
}

const canvas = document.querySelector('canvas')
canvas.width = window.innerWidth * window.devicePixelRatio
canvas.height = window.innerHeight * window.devicePixelRatio
canvas.style.width = window.innerWidth + 'px'
canvas.style.height = window.innerHeight + 'px'
const paintbrush = new Paintbrush(canvas)

const mouse = document.getElementById('mouse')
document.addEventListener('mousemove', (e) => {
    mouse.style.left = e.clientX + 'px'
    mouse.style.top = e.clientY + 'px'
})
