const svg = document.querySelector('svg');

const img = new Image();
img.src = "./1.png";

const width = 100;
const height = 100;
const delta = 3;

const canvas = document.createElement('canvas');
canvas.width = width;
canvas.height = height;
const ctx = canvas.getContext('2d');

for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
        let rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', i * delta);
        rect.setAttribute('y', j * delta);
        rect.setAttribute('width', delta);
        rect.setAttribute('height', delta);
        rect.setAttribute('fill', "#000");
        svg.appendChild(rect);
    }
}

const rectList = svg.querySelectorAll('rect');
img.onload = () => {
    ctx.drawImage(img, 0, 0, width, height);
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
            const rect = rectList[i * width + j];
            const color = getColor(i, j);
            rect.setAttribute('fill', color);
        }
    }
};

setTimeout(() => {
    img.src = "./2.png"
}, 5000);

function getColor(x, y) {
    const data = ctx.getImageData(x, y, 1, 1).data;
    return `#${data[0].toString(16)}${data[1].toString(16)}${data[2].toString(16)}`;
}