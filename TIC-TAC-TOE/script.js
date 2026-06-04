const boardElement = document.querySelector('.game-board');
const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const resetBtn = document.getElementById('reset-btn');

let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X"; // X will be Ruby Shard, O will be Sapphire Ring
let isGameActive = true;

// Vector Graphic Blocks defined as plain text variables
const rubyCrystalSVG = `
<svg viewBox="0 0 24 24" fill="none" style="color: #ff3e6c;">
    <path d="M12 2L4 9L12 22L20 9L12 2Z" fill="#ff3e6c" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M12 2V22M4 9H20" stroke="rgba(255,255,255,0.4)" stroke-width="1"/>
</svg>`;

const sapphireRingSVG = `
<svg viewBox="0 0 24 24" fill="none" style="color: #00f0ff;">
    <circle cx="12" cy="12" r="8" stroke="#00f0ff" stroke-width="3" fill="none"/>
    <circle cx="12" cy="12" r="4" stroke="#fff" stroke-width="1" fill="none" stroke-dasharray="2"/>
</svg>`;

const winConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

function handleCellClick(e) {
    // Find the cell clicked even if clicking directly on the SVG graphic inside it
    const cell = e.target.closest('.cell');
    if (!cell) return;
    
    const index = parseInt(cell.getAttribute('data-index'));

    if (board[index] !== "" || !isGameActive) return;

    board[index] = currentPlayer;
    
    // Inject the raw vector designs based on current player turn
    if (currentPlayer === "X") {
        cell.innerHTML = rubyCrystalSVG;
        checkResult();
    } else {
        cell.innerHTML = sapphireRingSVG;
        checkResult();
    }
}

function checkResult() {
    let roundWon = false;

    for (let i = 0; i < winConditions.length; i++) {
        const [a, b, c] = winConditions[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        statusText.textContent = `PLAYER ${currentPlayer === "X" ? "RUBY" : "SAPPHIRE"} WINS! 🏆`;
        statusText.style.color = currentPlayer === "X" ? "#ff3e6c" : "#00f0ff";
        isGameActive = false;
        return;
    }

    if (!board.includes("")) {
        statusText.textContent = "GRID STALEMATE! 🤝";
        statusText.style.color = "#ffbe0b";
        isGameActive = false;
        return;
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusText.textContent = `${currentPlayer === "X" ? "RUBY SHARD (X)" : "SAPPHIRE RING (O)"} TURN`;
    statusText.style.color = currentPlayer === "X" ? "#ff3e6c" : "#00f0ff";
}

function resetGame() {
    board = ["", "", "", "", "", "", "", "", ""];
    currentPlayer = "X";
    isGameActive = true;
    statusText.textContent = "RUBY SHARD (X) TURN";
    statusText.style.color = "#ff3e6c";
    cells.forEach(cell => cell.innerHTML = "");
}

boardElement.addEventListener('click', handleCellClick);
resetBtn.addEventListener('click', resetGame);