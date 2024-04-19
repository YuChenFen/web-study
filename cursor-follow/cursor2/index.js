let root = document.body;
let cursor = document.querySelector(".big-circle");
let circle = cursor.querySelector(".big-circle .circle");
let dot = cursor.querySelector(".big-circle .dot");


let pointerX = 0
let pointerY = 0
let cursorSize = 50

function move(event) {
    pointerX = event.pageX
    pointerY = event.pageY;
    circle.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0)`
    dot.style.transform = `translate3d(calc(-50% + ${pointerX}px), calc(-50% + ${pointerY}px), 0)`
    if (event.target.localName === 'h1') {
        circle.style.transform += ` scale(2.5)`
    }
}

function click() {
    circle.style.transform += ` scale(0.75)`;
    setTimeout(() => {
        circle.style.transform = circle.style.transform.replace(` scale(0.75)`, '')
    }, 35);
}
document.addEventListener("mousemove", move);
document.addEventListener("click", click);