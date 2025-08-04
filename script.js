
const playlist = [
    { src: "songs/XOXO_by_Feng.mp3", title: "XOXO (Feng)" },
    { src: "songs/Californication_by_RHCP.mp3", title: "Californication (RHCP)" },
    { src: "songs/Take_Care_ULTRAKILL.mp3", title: "Take Care (Ultrakill)" },
];


const backgroundEl = document.getElementById("background");
const btnStart = document.getElementById("btn-start");
const btnPause = document.getElementById("btn-pause");
const btnNext = document.getElementById("btn-next");
const btnPrev = document.getElementById("btn-prev");
const nowPlayingEl = document.getElementById("now-playing");
const modal = document.getElementById("modal");
const modalOk = document.getElementById("modal-ok");


async function loadAscii(path, element) {
    const res = await fetch(path);
    const text = await res.text();
    element.textContent = text;
}


loadAscii("ascii-art/ascii-frog.txt", backgroundEl);
loadAscii("ascii-art/buttons/start_button.txt", btnStart);
loadAscii("ascii-art/buttons/stop-button.txt", btnPause);
loadAscii("ascii-art/buttons/forward-button.txt", btnNext);
loadAscii("ascii-art/buttons/back-button.txt", btnPrev);


let audio = new Audio();
let audioCtx, analyser, sourceNode;
let dataArray, bufferLength;
let currentSongIndex = 0;

function setupAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        sourceNode = audioCtx.createMediaElementSource(audio);
        sourceNode.connect(analyser);
        analyser.connect(audioCtx.destination);
    }
}
function playSong(index) {
    currentSongIndex = index;
    audio.src = playlist[currentSongIndex].src;
    audio.play();
    updateNowPlaying();
}

function updateNowPlaying() {
    nowPlayingEl.textContent = "Now Playing: " + playlist[currentSongIndex].title;
}

function playNext() {
    playSong((currentSongIndex + 1) % playlist.length);
}

function playPrev() {
    playSong((currentSongIndex - 1 + playlist.length) % playlist.length);
}


btnStart.addEventListener("click", () => {
    audioCtx.resume();
    playSong(currentSongIndex);
});

btnPause.addEventListener("click", () => {
    audio.pause();
});

btnNext.addEventListener("click", playNext);
btnPrev.addEventListener("click", playPrev);

modalOk.addEventListener("click", () => {
    modal.style.display = "none";
    setupAudioContext();
});


audio.addEventListener("ended", playNext);

let pulseTime = 0;

function animate() {
    requestAnimationFrame(animate);


    pulseTime += 0.05;
    let basePulse = (Math.sin(pulseTime) + 1) / 2;

    if (!analyser) {

        let brightness = 50 + basePulse * 20;
        backgroundEl.style.color = `hsl(200, 100%, ${brightness}%)`;
        return;
    }

    analyser.getByteFrequencyData(dataArray);


    let amplitude = dataArray.reduce((a, b) => a + b, 0) / bufferLength;


    let high = dataArray.slice(Math.floor(bufferLength / 2)).reduce((a, b) => a + b, 0) / (bufferLength / 2);


    let low = dataArray.slice(0, Math.floor(bufferLength / 4)).reduce((a, b) => a + b, 0) / (bufferLength / 4);


    let hue = (low / 255) * 360;
    let brightness = 50 + basePulse * 20 + (high / 255) * 30;

    backgroundEl.style.color = `hsl(${hue}, 100%, ${brightness}%)`;
}

animate();
