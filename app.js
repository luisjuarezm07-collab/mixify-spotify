let library = [];

const audioA = new Audio();
const audioB = new Audio();

// Referencias a las etiquetas de tiempo en el HTML
const timeDisplayA = document.getElementById('time-a');
const totalDisplayA = document.getElementById('total-a');
const timeDisplayB = document.getElementById('time-b');
const totalDisplayB = document.getElementById('total-b');

// --- 1. NAVEGACIÓN ENTRE HOJAS (TABS) ---
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-links li').forEach(item => item.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    if (window.event && window.event.currentTarget) {
        window.event.currentTarget.classList.add('active');
    }
}

// --- 2. CARGAR E IMPORTAR CANCIONES (HOJA 1) ---
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
        
        // Cargar audios iniciales
        loadAudioSource('A');
        loadAudioSource('B');
        alert(`¡Se cargaron ${files.length} canciones con éxito!`);
    }
});

function loadAudioSource(track) {
    if (library.length === 0) return;
    if (track === 'A') {
        audioA.src = library[selectA.value].url;
        audioA.onloadedmetadata = () => {
            const duration = Math.floor(audioA.duration);
            document.getElementById('end-a').value = duration;
            totalDisplayA.textContent = duration + 's';
        };
    } else {
        audioB.src = library[selectB.value].url;
        audioB.onloadedmetadata = () => {
            const duration = Math.floor(audioB.duration);
            document.getElementById('end-b').value = duration;
            totalDisplayB.textContent = duration + 's';
        };
    }
}

selectA.addEventListener('change', () => loadAudioSource('A'));
selectB.addEventListener('change', () => loadAudioSource('B'));

// --- 3. CONTADOR DE SEGUNDOS EN TIEMPO REAL Y LÍMITE DE RECORTE ---
audioA.addEventListener('timeupdate', () => {
    const currentSec = Math.floor(audioA.currentTime);
    timeDisplayA.textContent = currentSec + 's';

    const endSec = parseFloat(document.getElementById('end-a').value) || audioA.duration;
    if (audioA.currentTime >= endSec) {
        stopTrack('A');
    }
});

audioB.addEventListener('timeupdate', () => {
    const currentSec = Math.floor(audioB.currentTime);
    timeDisplayB.textContent = currentSec + 's';

    const endSec = parseFloat(document.getElementById('end-b').value) || audioB.duration;
    if (audioB.currentTime >= endSec) {
        stopTrack('B');
    }
});

// --- 4. CONTROLES INDIVIDUALES (VOLUMEN, PLAY, PAUSE, STOP) ---
document.getElementById('vol-a').addEventListener('input', (e) => { audioA.volume = e.target.value; });
document.getElementById('vol-b').addEventListener('input', (e) => { audioB.volume = e.target.value; });

document.getElementById('btn-play-a').addEventListener('click', () => playTrack('A'));
document.getElementById('btn-pause-a').addEventListener('click', () => audioA.pause());
document.getElementById('btn-stop-a').addEventListener('click', () => stopTrack('A'));

document.getElementById('btn-play-b').addEventListener('click', () => playTrack('B'));
document.getElementById('btn-pause-b').addEventListener('click', () => audioB.pause());
document.getElementById('btn-stop-b').addEventListener('click', () => stopTrack('B'));

// --- FUNCIONES CORE DE REPRODUCCIÓN ---
function playTrack(track) {
    const isA = track === 'A';
    const audio = isA ? audioA : audioB;
    const select = isA ? selectA : selectB;
    const startInput = document.getElementById(isA ? 'start-a' : 'start-b').value;

    if (!audio.src || audio.src === "") {
        if (!library[select.value]) return alert("Carga canciones en la Hoja 1 primero.");
        audio.src = library[select.value].url;
    }

    const startTime = parseFloat(startInput) || 0;

    // Si está detenida o antes del tiempo recortado, salta al inicio definido
    if (audio.currentTime === 0 || audio.currentTime < startTime) {
        audio.currentTime = startTime;
    }

    audio.play();
}

function stopTrack(track) {
    const isA = track === 'A';
    const audio = isA ? audioA : audioB;
    const startTime = parseFloat(document.getElementById(isA ? 'start-a' : 'start-b').value) || 0;

    audio.pause();
    audio.currentTime = startTime; // Vuelve al segundo de inicio recortado
}

// --- CONTROLES DE LA MEZCLA GLOBAL ---
document.getElementById('btn-play-mix').addEventListener('click', () => {
    playTrack('A');
    playTrack('B');
});

document.getElementById('btn-pause-mix').addEventListener('click', () => {
    audioA.pause();
    audioB.pause();
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

    alert("¡Mezcla procesada con éxito! Revisa la Hoja 3.");
    showTab('tab-publish');
});

document.getElementById('btn-publish').addEventListener('click', () => {
    const title = document.getElementById('input-title').value;
    if (!title) return alert("Por favor ingresa un título para la mezcla.");
    alert(`¡Felicidades! La mezcla "${title}" se ha publicado con éxito.`);
});
// --- 5. LÓGICA DE LA HOJA 4 (ECUALIZADOR Y FADING) ---

// Crear el contexto de audio y nodos de ecualización
let eqAudioContext;
let biquadBass, biquadMid, biquadTreble;

function initEqualizer() {
    if (!eqAudioContext) {
        eqAudioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Filtro para Graves (Bass)
        biquadBass = eqAudioContext.createBiquadFilter();
        biquadBass.type = "lowshelf";
        biquadBass.frequency.value = 250;

        // Filtro para Medios (Mids)
        biquadMid = eqAudioContext.createBiquadFilter();
        biquadMid.type = "peaking";
        biquadMid.frequency.value = 1500;
        biquadMid.Q.value = 1;

        // Filtro para Agudos (Treble)
        biquadTreble = eqAudioContext.createBiquadFilter();
        biquadTreble.type = "highshelf";
        biquadTreble.frequency.value = 4000;
    }
}

// Conectar deslizadores del Ecualizador
document.getElementById('eq-bass').addEventListener('input', (e) => {
    initEqualizer();
    if (biquadBass) biquadBass.gain.value = parseFloat(e.target.value);
});

document.getElementById('eq-mid').addEventListener('input', (e) => {
    initEqualizer();
    if (biquadMid) biquadMid.gain.value = parseFloat(e.target.value);
});

document.getElementById('eq-treble').addEventListener('input', (e) => {
    initEqualizer();
    if (biquadTreble) biquadTreble.gain.value = parseFloat(e.target.value);
});

// Botón "Aplicar Efectos" (Fade In / Fade Out)
const btnApplyFx = document.querySelector('#tab-fx .btn-primary');

if (btnApplyFx) {
    btnApplyFx.addEventListener('click', () => {
        const hasFadeIn = document.getElementById('chk-fade-in').checked;
        const hasFadeOut = document.getElementById('chk-fade-out').checked;

        if (!hasFadeIn && !hasFadeOut) {
            return alert("Selecciona al menos un efecto (Fade In o Fade Out) para aplicar.");
        }

        // Aplicar efecto de Fade In a la Pista A si está reproduciéndose
        if (hasFadeIn && !audioA.paused) {
            audioA.volume = 0;
            let vol = 0;
            const fadeInInterval = setInterval(() => {
                if (vol < 1) {
                    vol += 0.1;
                    audioA.volume = Math.min(vol, 1);
                } else {
                    clearInterval(fadeInInterval);
                }
            }, 300); // Sube progresivamente durante 3 segundos
        }

        // Aplicar efecto de Fade Out si la pista está cerca del final
        if (hasFadeOut && !audioA.paused) {
            setTimeout(() => {
                let vol = audioA.volume;
                const fadeOutInterval = setInterval(() => {
                    if (vol > 0.1) {
                        vol -= 0.1;
                        audioA.volume = Math.max(vol, 0);
                    } else {
                        audioA.volume = 0;
                        audioA.pause();
                        clearInterval(fadeOutInterval);
                    }
                }, 300);
            }, 2000); // Comienza a bajar volumen progresivamente
        }

        alert("¡Efectos aplicados correctamente a la reproducción activa!");
    });
}
