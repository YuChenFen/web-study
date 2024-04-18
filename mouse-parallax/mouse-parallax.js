// 视差元素
const container = document.querySelector('.container');

document.addEventListener('mousemove', e => {
    let x = e.clientX / window.innerWidth;
    let y = e.clientY / window.innerHeight;
    container.style.transform = `
        translate(-${x * 100}px, -${y * 100}px)
        rotateX(${(y - 0.5) * 100}deg)
        rotateY(${(x - 0.5) * 100}deg)
    `;
});