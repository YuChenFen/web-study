const body = document.body;

const box_size = 100;

let drag_element = null;
let drag_element_box = null;
let to_element_box = null;

function init_grid(box_size) {
    let window_width = window.innerWidth;
    let window_height = window.innerHeight;
    let w_num = Math.floor(window_width / box_size);
    let h_num = Math.floor(window_height / box_size);
    body.style.grid = `repeat(${h_num}, ${box_size}px) / repeat(${w_num}, ${box_size}px)`;
    body.innerHTML = '';
    for (let i = 0; i < w_num * h_num; i++) {
        // 占位格子
        let placeholding = create_placeholding();
        // 元素盒子
        let box = create_box();
        // 元素
        let div = document.createElement('div');
        div.style.height = "100%";
        div.style.width = "100%";
        div.style.position = "relative";

        box.appendChild(div);
        placeholding.appendChild(box);
        body.appendChild(placeholding);
    }
}

function create_placeholding() {
    let placeholding = document.createElement('div');
    placeholding.classList.add('placeholding');
    return placeholding;
}
function create_box() {
    let box = document.createElement('div');
    box.classList.add('box');
    box.setAttribute('draggable', true);
    box.style.height = "100%";
    box.style.width = "100%";
    box.addEventListener("dragenter", (e) => {
        e.preventDefault();
        if (e.target.classList.contains("box")) {
            e.target.classList.add('box-hover');
            // 替换元素
            if (drag_element && drag_element_box != e.target) {
                to_element_box = e.target;
            }
        }
    });
    box.addEventListener("dragover", (e) => {
        e.preventDefault();
    });
    box.addEventListener("dragleave", (e) => {
        if (e.target.classList.contains("box")) {
            e.target.classList.remove('box-hover');
        }
    });
    box.addEventListener("dragstart", (e) => {
        drag_element = e.target.querySelector('div');
        drag_element_box = e.target;
        setTimeout(() => {
            drag_element.style.opacity = 0;
        }, 0);
    });
    box.addEventListener("dragend", (e) => {
        drag_element.style.opacity = 1;
        if (to_element_box) {
            drag_element_box.appendChild(to_element_box.querySelector('div'));
            to_element_box.appendChild(drag_element);
            drag_element = to_element_box.querySelector('div');
            drag_element_box = to_element_box;
            to_element_box.classList.remove('box-hover');
        }
        to_element_box = null;
        drag_element = null;
        drag_element_box = null;
    });


    box.addEventListener("drop", (e) => {
        e.preventDefault();
        // 上传图片
        if (e.target.classList.contains("box") && e.dataTransfer.files.length > 0) {
            let div = e.target.querySelector('div');
            let file = e.dataTransfer.files[0];
            let reader = new FileReader();
            reader.onload = (e) => {
                div.style.backgroundImage = `url(${e.target.result})`;
                div.style.backgroundSize = "cover";
                div.style.backgroundPosition = "center";
            };
            reader.readAsDataURL(file);
        }
        if (e.target.classList.contains("box")) {
            e.target.classList.remove('box-hover');
        }
    });
    return box;
}



init_grid(box_size);

// window.addEventListener('resize', () => {
//     init_grid(box_size);
// });