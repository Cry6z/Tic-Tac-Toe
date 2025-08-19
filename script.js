let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameActive = false;
let mode = "";
let difficulty = "normal";
let scores = JSON.parse(localStorage.getItem("scores")) || { X: 0, O: 0, Draw: 0 };

const boardElement = document.getElementById("board");
const statusElement = document.getElementById("status");
const scoreX = document.getElementById("scoreX");
const scoreO = document.getElementById("scoreO");
const scoreDraw = document.getElementById("scoreDraw");

function initBoard() {
  boardElement.innerHTML = "";
  board = ["", "", "", "", "", "", "", "", ""];
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("button");
    cell.classList.add("cell");
    cell.dataset.index = i;
    cell.addEventListener("click", handleCellClick);
    boardElement.appendChild(cell);
  }
}

function setMode(selectedMode) {
  mode = selectedMode;
  gameActive = true;
  currentPlayer = "X";
  statusElement.textContent =
    mode === "pvp" ? "Player X's turn" : "You are X. AI is O.";
  initBoard();
}

function setDifficulty(level) {
  difficulty = level;
}

function handleCellClick(e) {
  const index = e.target.dataset.index;
  if (board[index] !== "" || !gameActive) return;

  board[index] = currentPlayer;
  e.target.textContent = currentPlayer;

  if (checkWin(currentPlayer)) {
    statusElement.textContent = `Player ${currentPlayer} wins!`;
    scores[currentPlayer]++;
    updateScores();
    gameActive = false;
    return;
  }

  if (!board.includes("")) {
    statusElement.textContent = "It's a draw!";
    scores.Draw++;
    updateScores();
    gameActive = false;
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusElement.textContent = `Player ${currentPlayer}'s turn`;

  if (mode === "ai" && currentPlayer === "O" && gameActive) {
    setTimeout(aiMove, 500);
  }
}

function aiMove() {
  let move;
  if (difficulty === "easy") {
    move = getRandomMove();
  } else if (difficulty === "normal") {
    move = Math.random() < 0.5 ? getBestMove() : getRandomMove();
  } else {
    move = getBestMove();
  }

  board[move] = "O";
  document.querySelector(`.cell[data-index='${move}']`).textContent = "O";

  if (checkWin("O")) {
    statusElement.textContent = "AI wins!";
    scores.O++;
    updateScores();
    gameActive = false;
    return;
  }

  if (!board.includes("")) {
    statusElement.textContent = "It's a draw!";
    scores.Draw++;
    updateScores();
    gameActive = false;
    return;
  }

  currentPlayer = "X";
  statusElement.textContent = "Your turn";
}

function getRandomMove() {
  const available = board.map((v, i) => (v === "" ? i : null)).filter(v => v !== null);
  return available[Math.floor(Math.random() * available.length)];
}

function getBestMove() {
  let bestScore = -Infinity;
  let move;
  for (let i = 0; i < 9; i++) {
    if (board[i] === "") {
      board[i] = "O";
      let score = minimax(board, 0, false);
      board[i] = "";
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(newBoard, depth, isMaximizing) {
  if (checkWin("O")) return 10 - depth;
  if (checkWin("X")) return depth - 10;
  if (!newBoard.includes("")) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (newBoard[i] === "") {
        newBoard[i] = "O";
        let score = minimax(newBoard, depth + 1, false);
        newBoard[i] = "";
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (newBoard[i] === "") {
        newBoard[i] = "X";
        let score = minimax(newBoard, depth + 1, true);
        newBoard[i] = "";
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function checkWin(player) {
  const winPatterns = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];
  return winPatterns.some(pattern =>
    pattern.every(index => board[index] === player)
  );
}

function restartGame() {
  initBoard();
  currentPlayer = "X";
  gameActive = true;
  statusElement.textContent =
    mode === "pvp" ? "Player X's turn" : "You are X. AI is O.";
}

function resetScores() {
  scores = { X: 0, O: 0, Draw: 0 };
  updateScores();
}

function updateScores() {
  scoreX.textContent = scores.X;
  scoreO.textContent = scores.O;
  scoreDraw.textContent = scores.Draw;
  localStorage.setItem("scores", JSON.stringify(scores));
}

updateScores();
