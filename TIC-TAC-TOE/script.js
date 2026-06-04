const arena = document.getElementById('game-arena');
const statusText = document.getElementById('status');
const resetBtn = document.getElementById('reset-btn');
const modeBtn = document.getElementById('mode-btn');
const engineSelect = document.getElementById('game-engine-select');

let currentMode = "classic"; // classic, mega, layer3d, ultimate
let isAiMode = true;
let currentPlayer = "X";
let isGameActive = true;

// Core Memory Structures
let flatBoard = []; 
let ultimateBoardState = []; // Main states tracking for inception mode
let activeMiniBoardIndex = null; // Enforces Ultimate constraints rules

// Upgraded Ruby Crystal: Intricate multi-faceted diamond shard with a structural light center
const rubyCrystal = `
<svg viewBox="0 0 24 24" fill="none" style="--glow-color: rgba(255, 62, 108, 0.45);">
    <path d="M12 2L4 9L12 22L20 9L12 2Z" fill="#ff3e6c" stroke="#ffffff" stroke-width="1.2" stroke-linejoin="round"/>
    <path d="M12 2V22M4 9H20" stroke="rgba(255, 255, 255, 0.35)" stroke-width="1"/>
    <path d="M12 6L8 9L12 15L16 9L12 6Z" fill="rgba(255, 255, 255, 0.25)" />
</svg>`;

// Upgraded Sapphire Ring: Sleek dual-concentric precision orbit halo rings
const sapphireRing = `
<svg viewBox="0 0 24 24" fill="none" style="--glow-color: rgba(0, 240, 255, 0.45);">
    <circle cx="12" cy="12" r="8" stroke="#00f0ff" stroke-width="2.5" fill="none"/>
    <circle cx="12" cy="12" r="5" stroke="#ffffff" stroke-width="1" fill="none" stroke-dasharray="2 1"/>
    <circle cx="12" cy="12" r="2" fill="#00f0ff" opacity="0.7"/>
</svg>`;

function playSound(pitch) {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(pitch, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.start(); osc.stop(ctx.currentTime + 0.15);
}

// Engine Init Router Matrix Lookups
function initEngine() {
    currentMode = engineSelect.value;
    currentPlayer = "X";
    isGameActive = true;
    activeMiniBoardIndex = null;
    arena.innerHTML = "";
    statusText.textContent = "RUBY SHARD (X) TURN";
    statusText.style.color = "#ff3e6c";

    if (currentMode === "classic") {
        flatBoard = Array(9).fill("");
        const grid = document.createElement('div');
        grid.className = "grid-3x3";
        for(let i=0; i<9; i++) grid.appendChild(createCell(i));
        arena.appendChild(grid);
    } else if (currentMode === "mega") {
        flatBoard = Array(16).fill("");
        const grid = document.createElement('div');
        grid.className = "grid-4x4";
        for(let i=0; i<16; i++) grid.appendChild(createCell(i));
        arena.appendChild(grid);
    } else if (currentMode === "layer3d") {
        flatBoard = Array(27).fill(""); // 3 layers of 9 squares
        const stackContainer = document.createElement('div');
        stackContainer.className = "arena-3d";
        for(let l=0; l<3; l++) {
            const lbl = document.createElement('div');
            lbl.className = "layer-label"; lbl.textContent = `DIMENSION LAYER 0${l+1}`;
            stackContainer.appendChild(lbl);
            const grid = document.createElement('div');
            grid.className = "grid-3x3";
            for(let s=0; s<9; s++) grid.appendChild(createCell(l*9 + s));
            stackContainer.appendChild(grid);
        }
        arena.appendChild(stackContainer);
    } else if (currentMode === "ultimate") {
        ultimateBoardState = Array(9).fill(""); // Macro tracking matrix elements
        flatBoard = Array(9).fill(null).map(() => Array(9).fill("")); // Mini matrix tracker elements
        const macroBoard = document.createElement('div');
        macroBoard.className = "ultimate-board";
        for(let m=0; m<9; m++) {
            const miniGrid = document.createElement('div');
            miniGrid.className = "mini-board active-target";
            miniGrid.setAttribute('id', `mini-${m}`);
            for(let c=0; c<9; c++) {
                const cell = document.createElement('button');
                cell.className = "cell mini-cell";
                cell.setAttribute('data-macro', m);
                cell.setAttribute('data-mini', c);
                cell.addEventListener('click', handleUltimateClick);
                miniGrid.appendChild(cell);
            }
            macroBoard.appendChild(miniGrid);
        }
        arena.appendChild(macroBoard);
    }
}

function createCell(index) {
    const cell = document.createElement('button');
    cell.className = "cell";
    cell.setAttribute('data-index', index);
    cell.addEventListener('click', handleStandardClick);
    return cell;
}

// Handler routines for Classic, Mega, and 3D
function handleStandardClick(e) {
    if (!isGameActive || (isAiMode && currentPlayer === "O")) return;
    const cell = e.target.closest('.cell');
    const idx = parseInt(cell.getAttribute('data-index'));
    if (flatBoard[idx] !== "") return;

    executeStandardMove(idx, cell);

    if (isGameActive && isAiMode && currentPlayer === "O") {
        setTimeout(() => {
            const available = flatBoard.map((c, i) => c === "" ? i : null).filter(v => v !== null);
            if (available.length > 0) {
                const aiIdx = available[Math.floor(Math.random() * available.length)];
                const aiCell = document.querySelector(`[data-index="${aiIdx}"]`);
                executeStandardMove(aiIdx, aiCell);
            }
        }, 400);
    }
}

function executeStandardMove(idx, cell) {
    flatBoard[idx] = currentPlayer;
    cell.innerHTML = currentPlayer === "X" ? rubyCrystal : sapphireRing;
    playSound(currentPlayer === "X" ? 520 : 390);
    evaluateStandardWin();
}

function evaluateStandardWin() {
    let win = false;
    if (currentMode === "classic") {
        const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
        win = lines.some(l => flatBoard[l[0]] && flatBoard[l[0]] === flatBoard[l[1]] && flatBoard[l[0]] === flatBoard[l[2]]);
    } else if (currentMode === "mega") {
        const lines = [
            [0,1,2,3],[4,5,6,7],[8,9,10,11],[12,13,14,15], // rows
            [0,4,8,12],[1,5,9,13],[2,6,10,14],[3,7,11,15], // cols
            [0,5,10,15],[3,6,9,12] // diagonals
        ];
        win = lines.some(l => flatBoard[l[0]] && flatBoard[l[0]] === flatBoard[l[1]] && flatBoard[l[0]] === flatBoard[l[2]] && flatBoard[l[0]] === flatBoard[l[3]]);
    } else if (currentMode === "layer3d") {
        for(let i=0; i<9; i++) {
            if(flatBoard[i] && flatBoard[i] === flatBoard[i+9] && flatBoard[i] === flatBoard[i+18]) win = true; 
        }
    }

    if (win) {
        statusText.textContent = `PLAYER ${currentPlayer} WINS THE MATRIX! 🏆`;
        isGameActive = false;
        return;
    }
    
    if (!flatBoard.includes("")) { statusText.textContent = "STALEMATE MATRIX DETECTED! 🤝"; isGameActive = false; return; }
    togglePlayerTurn();
}

// Handler routines specific to Ultimate Inception Engine Layout Configurations
function handleUltimateClick(e) {
    if (!isGameActive || (isAiMode && currentPlayer === "O")) return;
    const cell = e.target.closest('.cell');
    const macroIdx = parseInt(cell.getAttribute('data-macro'));
    const miniIdx = parseInt(cell.getAttribute('data-mini'));

    if (activeMiniBoardIndex !== null && macroIdx !== activeMiniBoardIndex) return; 
    if (flatBoard[macroIdx][miniIdx] !== "" || ultimateBoardState[macroIdx] !== "") return;

    executeUltimateMove(macroIdx, miniIdx, cell);

    if (isGameActive && isAiMode && currentPlayer === "O") {
        setTimeout(() => {
            const targetM = (ultimateBoardState[activeMiniBoardIndex] === "") ? activeMiniBoardIndex : Math.floor(Math.random()*9);
            const availableMini = flatBoard[targetM].map((c, i) => c === "" ? i : null).filter(v => v !== null);
            if(availableMini.length > 0) {
                const aiMini = availableMini[Math.floor(Math.random()*availableMini.length)];
                const aiCell = document.querySelector(`[data-macro="${targetM}"][data-mini="${aiMini}"]`);
                executeUltimateMove(targetM, aiMini, aiCell);
            }
        }, 400);
    }
}

function executeUltimateMove(macro, mini, cell) {
    flatBoard[macro][mini] = currentPlayer;
    cell.innerHTML = currentPlayer === "X" ? rubyCrystal : sapphireRing;
    playSound(currentPlayer === "X" ? 600 : 450);

    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    const miniWin = lines.some(l => flatBoard[macro][l[0]] && flatBoard[macro][l[0]] === flatBoard[macro][l[1]] && flatBoard[macro][l[0]] === flatBoard[macro][l[2]]);

    if (miniWin) {
        ultimateBoardState[macro] = currentPlayer;
        document.getElementById(`mini-${macro}`).classList.add(`won-${currentPlayer}`);
    }

    const macroWin = lines.some(l => ultimateBoardState[l[0]] && ultimateBoardState[l[0]] === ultimateBoardState[l[1]] && ultimateBoardState[l[0]] === ultimateBoardState[l[2]]);
    if (macroWin) {
        statusText.textContent = `PLAYER ${currentPlayer} CONQUERS THE INCEPTION VECTOR! 🏆`;
        isGameActive = false;
        return;
    }

    activeMiniBoardIndex = mini;
    document.querySelectorAll('.mini-board').forEach((b, i) => {
        b.classList.remove('active-target');
        if (ultimateBoardState[i] === "" && (activeMiniBoardIndex === i || ultimateBoardState[activeMiniBoardIndex] !== "")) {
            b.classList.add('active-target');
        }
    });

    togglePlayerTurn();
}

function togglePlayerTurn() {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusText.textContent = `${currentPlayer === "X" ? "RUBY SHARD (X)" : "SAPPHIRE RING (O)"} TURN`;
    statusText.style.color = currentPlayer === "X" ? "#ff3e6c" : "#00f0ff";
}

engineSelect.addEventListener('change', initEngine);
resetBtn.addEventListener('click', initEngine);
modeBtn.addEventListener('click', () => {
    isAiMode = !isAiMode;
    modeBtn.textContent = isAiMode ? "PLAYER VS AI" : "2 PLAYER MODE";
    initEngine();
});

// Bootstrap active loop states directly on load
initEngine();