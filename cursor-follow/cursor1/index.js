const cursor = document.querySelector('.arrow-pointer');
const root = document.body;

let previousPointerX = 0;
let previousPointerY = 0;
let pointerX = 0;
let pointerY = 0;
let distanceX = 0;
let distanceY = 0;
let distance = 0;
let degrees = 57.296;
let angle = 0;
let previousAngle = 0;
let angleDisplace = 0;

function move(event) {
    previousPointerX = pointerX;
    previousPointerY = pointerY;
    pointerX = event.pageX + root.getBoundingClientRect().x - 9;
    pointerY = event.pageY + root.getBoundingClientRect().y - 9;
    distanceX = previousPointerX - pointerX;
    distanceY = previousPointerY - pointerY;
    distance = Math.sqrt(distanceY ** 2 + distanceX ** 2);

    cursor.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0)`;
    if (distance > 1) {
        rotate()
    } else {
        cursor.style.transform += ` rotate(${angleDisplace}deg)`
    }
}

function rotate() {
    let unsortedAngle = Math.atan(Math.abs(distanceY) / Math.abs(distanceX)) * degrees;
    previousAngle = angle;

    if (distanceX <= 0 && distanceY >= 0) {
        angle = 90 - unsortedAngle + 0
    } else if (distanceX < 0 && distanceY < 0) {
        angle = unsortedAngle + 90
    } else if (distanceX >= 0 && distanceY <= 0) {
        angle = 90 - unsortedAngle + 180
    } else if (distanceX > 0 && distanceY > 0) {
        angle = unsortedAngle + 270
    }

    if (isNaN(angle)) {
        angle = previousAngle
    } else {
        if (angle - previousAngle <= -270) {
            angleDisplace += 360 + angle - previousAngle
        } else if (angle - previousAngle >= 270) {
            angleDisplace += angle - previousAngle - 360
        } else {
            angleDisplace += angle - previousAngle
        }
    }
    cursor.style.transform += ` rotate(${angleDisplace}deg)`
}


document.addEventListener('mousemove', move);