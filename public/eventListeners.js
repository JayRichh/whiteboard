import * as elementRefs from "./elementReferences.js";

import {
  init,
  draw,
  saveLocalDrawings,
  loadLocalDrawings,
  switchToClashMode,
  switchToLocalMode,
  switchToCollabMode,
  createRoom,
  joinRoom,
  startRound,
  endRound,
  players,
} from "./gameLogic.js";

let {
  x1,
  y1,
  ctx,
  canvasElement,
  socket,
  timer,
  timerDisplay,
  scoreDisplay,
  playersList,
  winnerDisplay,
  guessesList,
  room,
  currentPlayer,
  scores,
  mode,
  drawPoints,
  clashBtn,
  localBtn,
  collabBtn,
  joinContainer,
  createRoomBtn,
  roomCode,
  shareCode,
  joinBtn,
  drawing,
  joinCode,
  connectBtn,
  connections,
  guessInput,
  guessBtn,
  clearBtn,
  colorPicker,
  promptDisplay,
  roundActive,
  currentPrompt,
  guesses,
  gameStartBtn,
  gameEndBtn,
  playerNameInput,
  strokeSizeSlider,
  strokeTypeDropdown,
  redBtn,
  blueBtn,
  greenBtn,
  blackBtn,

} = elementRefs;

canvasElement.addEventListener("mousedown", (e) => {
  init(e);
});

canvasElement.addEventListener("mousemove", (e) => {
  draw(e);
});

canvasElement.addEventListener("mouseup", (e) => {
  drawing = false;
  console.log(mode);
  console.log(drawing);

  if (mode === "local") {
    saveLocalDrawings();
  }
});

clearBtn.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  drawPoints = [];
  saveLocalDrawings(); 
});

redBtn.addEventListener("click", () => {
  ctx.strokeStyle = "#FF0000";
  colorPicker.value = "#FF0000";
});

blueBtn.addEventListener("click", () => {
  ctx.strokeStyle = "#0000FF";
  colorPicker.value = "#0000FF";
});

greenBtn.addEventListener("click", () => {
  ctx.strokeStyle = "#00FF00";
  colorPicker.value = "#00FF00";
});

blackBtn.addEventListener("click", () => {
  ctx.strokeStyle = "black";
  colorPicker.value = "#000000";
});

localBtn.addEventListener("click", switchToLocalMode);
collabBtn.addEventListener("click", switchToCollabMode);
clashBtn.addEventListener("click", switchToClashMode);

createRoomBtn.addEventListener("click", createRoom);
joinBtn.addEventListener("click", joinRoom);

guessBtn.addEventListener("click", () => {
  const guess = guessInput.value;
  if (guess.trim() !== "") {
    socket.emit("submitGuess", { room, guess });
  }
});

colorPicker.addEventListener("input", (e) => {
  ctx.strokeStyle = e.target.value;
});

gameStartBtn.addEventListener("click", startRound);

gameEndBtn?.addEventListener("click", endRound);

playerNameInput.addEventListener("input", (e) => {
  const playerName = e.target.value;
  if (playerName.trim() !== "") {
    socket.emit("updatePlayerName", { room, playerName });
  }
});

strokeSizeSlider.addEventListener("input", (e) => {
  ctx.lineWidth = e.target.value;
});

strokeTypeDropdown.addEventListener("change", (e) => {
  switch (e.target.value) {
    case "solid":
      ctx.setLineDash([]);
      break;
    case "dotted":
      ctx.setLineDash([1, 5]);
      break;
    case "dashed":
      ctx.setLineDash([5, 15]);
      break;
    default:
      ctx.setLineDash([]);
      break;
  }
});

playerNameInput.addEventListener("input", (e) => {
  const playerName = e.target.value;
  if (playerName.trim() !== "") {
    socket.emit("updatePlayerName", { room, playerName });
  }
});

window.addEventListener("updateScore", (e) => {
  localStorage.setItem("score", e.detail.score);
});

window.onload = function() {
  mode = "local";
  loadLocalDrawings();
  players = [];
  scores = {}
};

guessBtn.addEventListener("click", () => {
  const guess = guessInput.value;
  if (guess.trim() !== "") {
    socket.emit("submitGuess", { room, guess });
  }
});

window.addEventListener("updatePrompt", (e) => {
  promptDisplay.textContent = e.detail.prompt;
});

window.addEventListener("updateWinner", (e) => {
  winnerDisplay.textContent = e.detail.winner;
  if (!e.detail.winner) {
    scores[currentPlayer]--;
    scoreDisplay.textContent = scores[currentPlayer];
  }
});

// Game Start/End Logic
gameStartBtn.addEventListener("click", () => {
  socket.emit("startGame", { room });
});

gameEndBtn?.addEventListener("click", () => {
  socket.emit("endGame", { room });
});

window.addEventListener("startRound", startRound);
window.addEventListener("endRound", endRound);

// Start on Play
gameStartBtn.addEventListener("click", startRound);
