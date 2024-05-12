const hours1_lines = document.querySelectorAll('#hours1 line');
const hours0_lines = document.querySelectorAll('#hours0 line');
const minute1_lines = document.querySelectorAll('#minute1 line');
const minute0_lines = document.querySelectorAll('#minute0 line');
const second1_lines = document.querySelectorAll('#second1 line');
const second0_lines = document.querySelectorAll('#second0 line');

const number = [
    [1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 0, 0, 0, 0],
    [1, 1, 0, 1, 1, 0, 1],
    [1, 1, 1, 1, 0, 0, 1],
    [0, 1, 1, 0, 0, 1, 1],
    [1, 0, 1, 1, 0, 1, 1],
    [1, 0, 1, 1, 1, 1, 1],
    [1, 1, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 0, 1, 1]
]

function change(lineList, num) {
    for (let i = 0; i < 7; i++) {
        if (number[num][i] == 1) {
            lineList[i].style.strokeDashoffset = 0
        }else{
            lineList[i].style.strokeDashoffset = 100
        }
    }
}
let cur = 0;
setInterval(() => {
    const date = new Date();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    console.log(hours, minutes, seconds);
    change(hours1_lines, Math.floor(hours / 10));
    change(hours0_lines, hours % 10);
    change(minute1_lines, Math.floor(minutes / 10));
    change(minute0_lines, minutes % 10);
    change(second1_lines, Math.floor(seconds / 10));
    change(second0_lines, seconds % 10);
}, 1000)