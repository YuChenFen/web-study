const fileInput = document.querySelector("#file");
const AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;
if(!AudioContext){
    alert("您的浏览器不支持audio API，请更换浏览器（chrome、firefox）再尝试！");
}

fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
        const audio = document.createElement("audio");
        audio.src = URL.createObjectURL(file);
        audio.play();
        audio.addEventListener("loadedmetadata", () => {
            const audioContext = new AudioContext();
            const source = audioContext.createMediaElementSource(audio);
            const analyser = audioContext.createAnalyser();
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            analyser.fftSize = 512;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            const canvas = document.querySelector("#canvas");
            canvas.style.width = window.innerWidth + "px";
            canvas.style.height = window.innerHeight + "px";
            canvas.width = window.innerWidth * devicePixelRatio;
            canvas.height = window.innerHeight * devicePixelRatio;
            const ctx = canvas.getContext("2d");
            const len = Math.floor(dataArray.length / 3 * 2);
            const width = 3;
            ctx.fillStyle = "#c8bdb2";

            const draw = () => {
                console.log(dataArray[0]);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                analyser.getByteTimeDomainData(dataArray);
                let x = (canvas.width - (width * len) - (len - 1) * 10) / 2;
                for (let i = 0; i < len; i++) {
                    let height = (dataArray[i] - 128) / 255 * canvas.height * 3;
                    if (height <= 0) height = 1;
                    ctx.fillRect(x, (canvas.height - height) / 2, width, height);
                    x += width + 10;
                }
                requestAnimationFrame(draw);
            }
            draw();
        })
    }
});
