let library = [];

// Elementos de Audio para Pista A y Pista B
const audioA = new Audio();
const audioB = new Audio();

// Temporizadores para detener la reproducción según el tiempo final recortado
let timerA = null;
let timerB = null;

// --- 1. NAVEGACIÓN ---
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-links li').forEach(item => item.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}

// --- 2. CARGAR CANCIONES ---
const audioInput = document.getElementById('audio-input');
const trackList = document.getElementById('track-list');
const selectA = document.getElementById('select-track-a');
const selectB = document.getElementById('select-track-b');

audioInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
        trackList.innerHTML = '';
        selectA.innerHTML = '';
        selectB.innerHTML = '';
        library = [];

        files.forEach((file, index) => {
            const trackUrl = URL.createObjectURL(file);
            library.push({ id: index, name: file.name, url: trackUrl });

            const li = document.createElement('li');
            li.innerHTML = `<i class="fa-solid fa-music"></i> ${file.name}`;
            trackList.appendChild(li);

            selectA.appendChild(new Option(file.name, index));
            selectB.appendChild(new Option(file.name, index));
        });

        if (files.length > 1) selectB.selectedIndex = 1;
        alert(`¡Se cargaron ${files.length} canciones con éxito!`);
    }
});

// Actualizar fuente cuando cambia el selector
selectA.addEventListener('change', () => { audioA.src = library[selectA.value].url; });
selectB.addEventListener('change', () => { audioB.src = library[selectB.value].url; });

// --- 3. CONTROLES PISTA A ---
document.getElementById('vol-a').addEventListener('input', (e) => { audioA.volume = e.target.value; });

document.getElementById('btn-play-a').addEventListener('click', () => playTrack('A'));
document.getElementById('btn-pause-a').addEventListener('click', () => { audioA.pause(); clearTimeout(timerA); });
document.getElementById('btn-stop-a').addEventListener('click', () => stopTrack('A'));

// --- 4. CONTROLES PISTA B ---
document.getElementById('vol-b').addEventListener('input', (e) => { audioB.volume = e.target.value; });

document.getElementById('btn-play-b').addEventListener('click', () => playTrack('B'));
document.getElementById('btn-pause-b').addEventListener('click', () => { audioB.pause(); clearTimeout(timerB); });
document.getElementById('btn-stop-b').addEventListener('click', () => stopTrack('B'));

// --- FUNCIONES DE REPRODUCCIÓN CON CORTE ---
function playTrack(track) {
    const isA = track === 'A';
    const audio = isA ? audioA : audioB;
    const select = isA ? selectA : selectB;
    const startInput = document.getElementById(isA ? 'start-a' : 'start-b').value;
    const endInput = document.getElementById(isA ? 'end-a' : 'end-b').value;

    if (!audio.src || audio.src === "") {
        if (!library[select.value]) return alert("Carga canciones primero.");
        audio.src = library[select.value].url;
    }

    const startTime = parseFloat(startInput) || 0;
    const endTime = parseFloat(endInput) || audio.duration;

    // Si la canción estaba detenida, iniciar desde el segundo recortado
    if (audio.paused && audio.currentTime === 0) {
        audio.currentTime = startTime;
    }

    audio.play();

    // Detener automáticamente al llegar al segundo 'Fin'
    const durationLeft = (endTime - audio.currentTime) * 1000;
    if (isA) {
        clearTimeout(timerA);
        if (durationLeft > 0) timerA = setTimeout(() => stopTrack('A'), durationLeft);
    } else {
        clearTimeout(timerB);
        if (durationLeft > 0) timerB = setTimeout(() => stopTrack('B'), durationLeft);
    }
}

function stopTrack(track) {
    if (track === 'A') {
        audioA.pause();
        audioA.currentTime = 0;
        clearTimeout(timerA);
    } else {
        audioB.pause();
        audioB.currentTime = 0;
        clearTimeout(timerB);
    }
}

// --- CONTROLES DE LA MEZCLA GLOBAL ---
document.getElementById('btn-play-mix').addEventListener('click', () => {
    playTrack('A');
    playTrack('B');
});

document.getElementById('btn-pause-mix').addEventListener('click', () => {
    audioA.pause();
    audioB.pause();
    clearTimeout(timerA);
    clearTimeout(timerB);
});

document.getElementById('btn-stop-mix').addEventListener('click', () => {
    stopTrack('A');
    stopTrack('B');
});

// --- HOJA 3: PROCESAR Y PUBLICAR ---
document.getElementById('btn-render-mix').addEventListener('click', () => {
    if (library.length < 1) return alert("Primero carga canciones.");
    
    stopTrack('A');
    stopTrack('B');

    const finalPlayer = document.getElementById('final-audio-player');
    finalPlayer.src = library[selectA.value].url;

    alert("¡Mezcla procesada con éxito! Revisa la Sección 3.");
    showTab('tab-publish');
});

document.getElementById('btn-publish').addEventListener('click', () => {
    const title = document.getElementById('input-title').value;
    if (!title) return alert("Por favor ingresa un título para la mezcla.");
    alert(`¡Felicidades! La mezcla "${title}" se ha publicado con éxito.`);
});