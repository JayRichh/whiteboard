import * as elementRefs from "./elementReferences.js";

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
  strokeTypeDropdown,
} = elementRefs;

let players = [];

let canvas = canvasElement;

// Functions
export function init(e) {
  x1 = e.offsetX;
  y1 = e.offsetY;
  drawing = e.buttons === 1 ? true : false;
}

export function updateDisplayFromLocalStorage() {
  const score = localStorage.getItem("score");
  const playerName = localStorage.getItem("playerName");
  const roomCode = localStorage.getItem("roomCode");
  const mode = localStorage.getItem("mode");
  const drawPoints = JSON.parse(localStorage.getItem("drawPoints"));
  const strokeSize = localStorage.getItem("strokeSize");
  const strokeColor = localStorage.getItem("strokeColor");
  const strokeType = localStorage.getItem("strokeType");

  if (score) scoreDisplay.textContent = score;
  if (playerName) playerNameInput.value = playerName;
  if (roomCode) joinCode.value = roomCode;
  if (drawPoints) drawPoints.forEach((point) => drawWithColorAndStroke(point));
  // if (strokeSize) strokeSizeSlider?.value = strokeSize;
  if (strokeColor) colorPicker.value = strokeColor;
  if (strokeType) strokeTypeDropdown.value = strokeType;

  switchMode(mode);
}

export function switchMode(mode) {
  const modeSwitch = {
    local: switchToLocalMode,
    collab: switchToCollabMode,
    clash: switchToClashMode,
  };

  if (mode && modeSwitch[mode]) modeSwitch[mode]();
}

export function drawWithColorAndStroke(point) {
  ctx.strokeStyle = point.color;
  ctx.lineWidth = point.size;
  ctx.lineCap = point.type;
  ctx.lineJoin = point.type === "butt" ? "bevel" : "round";
  draw(point);
}

export function joinRoomFromLocalStorage() {
  const room = localStorage.getItem("room");
  if (room) socket.emit("join-room", room);
}

function switchToClashMode() {
  mode = "clash";
  drawPoints = [];
  clashBtn.classList.add("active");
  localBtn.classList.remove("active");
  collabBtn.classList.remove("active");
  createRoomBtn.style.display = "block";
  clearCanvas();
  joinContainer.style.display = "block";
}

function switchToLocalMode() {
  mode = "local";
  localBtn.classList.add("active");
  collabBtn.classList.remove("active");
  clashBtn.classList.remove("active");
  createRoomBtn.style.display = "none";
  joinContainer.style.display = "none";

  loadLocalDrawings().then(() => {
    drawPoints.forEach((point) => drawOnCanvas(point));
  });
}

document.addEventListener("DOMContentLoaded", function () {

  if (mode === "local") {
    localBtn?.classList.add("active");
    loadLocalDrawings().then(() => {
      drawPoints.forEach((point) => drawOnCanvas(point));
    });
  }
});

function switchToCollabMode() {
  mode = "collab";
  drawPoints = [];
  collabBtn.classList.add("active");
  clashBtn.classList.remove("active");
  localBtn.classList.remove("active");

  connectBtn.style.display = "block";
  createRoomBtn.style.display = "block";
  roomCode.style.display = "block";

  clearCanvas();
  joinContainer.style.display = "block";
}

export const draw = (e) => {
  if (!drawing || e.buttons !== 1) return;
  const point = {
    x1,
    y1,
    x2: e.offsetX,
    y2: e.offsetY,
    color: ctx.strokeStyle,
    size: ctx.lineWidth,
    type: ctx.lineCap,
  };
  drawOnCanvas(point);
  if (mode === "local") {
    drawPoints.push(point);
  } else if (mode === "collab" && room) {
    socket.emit("draw", { ...point, room });
  }
  x1 = e.offsetX;
  y1 = e.offsetY;
};

function drawOnCanvas(point) {
  ctx.beginPath();
  ctx.moveTo(point.x1, point.y1);
  ctx.lineTo(point.x2, point.y2);
  ctx.stroke();
  ctx.closePath();
  ctx.strokeStyle = point.color;
}

// Game logic
function startRound() {
  roundActive = true;
  currentPlayer = selectRandomPlayer();
  currentPrompt = selectRandomPrompt();
  timer = 120;
  guesses = [];
  displayPrompt(currentPrompt);
  updateTimer();
  socket.emit("startRound", { room });
}

function endRound() {
  roundActive = false;
  const winner = determineWinner();
  updateScore(winner);
  clearCanvas();
  resetTimer();
  socket.emit("endRound", { room });
}

function selectRandomPlayer() {
  return players[Math.floor(Math.random() * players.length)];
}

function selectRandomPrompt() {
  const prompts = ["house", "horse", "car", "tree"];
  return prompts[Math.floor(Math.random() * prompts.length)];
}

function displayPrompt(prompt) {
  // Display the prompt to the current player
  if (currentPlayer === "me") {
    // Replace with actual player ID
    promptDisplay.textContent = prompt;
  }
}

function blackBtn() {
  ctx.strokeStyle = "#000000";
}

function redBtn() {
  ctx.strokeStyle = "#FF0000";
}

function blueBtn() {
  ctx.strokeStyle = "#0000FF";
}

function greenBtn() {
  ctx.strokeStyle = "#00FF00";
}

function updateTimer() {
  const timerInterval = setInterval(() => {
    if (timer > 0) {
      timer--;
      timerDisplay.textContent = timer;
    } else {
      clearInterval(timerInterval);
      endRound();
    }
  }, 1000);
}

function determineWinner() {
  // Determine the winner based on the guesses,  current prompt, and current player include logic to update the score and reset etc.
  return guesses.includes(currentPrompt) ? "guesser" : "drawer";
}

function updateScore(winner) {
  // Update the score of the winner, refine and maybe combine with above
  scores[winner] = (scores[winner] || 0) + 1;
  scoreDisplay.textContent = scores[winner];
}

function resetTimer() {
  timer = null;
  timerDisplay.textContent = "";
}

function createRoom() {
  joinCode.style.display = "none";
  shareCode.style.display = "block";
  const roomCode = Math.random().toString(36).substring(2, 15);
  socket.emit("create-room", roomCode);
}

function joinRoom() {
  shareCode.style.display = "none";
  joinCode.style.display = "block";
  const roomCode = joinCode.value;
  socket.emit("join-room", roomCode);
}

function saveLocalDrawings() {
  localStorage.setItem("drawPoints", JSON.stringify(drawPoints));
}

function loadLocalDrawings() {
  return new Promise((resolve, reject) => {
    const savedDrawPoints = JSON.parse(localStorage.getItem("drawPoints"));
    if (savedDrawPoints) {
      drawPoints = savedDrawPoints;
      drawPoints.forEach((point) => {
        ctx.strokeStyle = point.color;
        draw(point);
      });
    }

    if (drawPoints.length > 0) {
      console.log(drawPoints[drawPoints.length - 1].color);
      ctx.strokeStyle = drawPoints[drawPoints.length - 1].color;
      resolve();
    } else {
      reject("No drawPoints found in local storage.");
    }
  });
}
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export {
  drawOnCanvas,
  selectRandomPlayer,
  selectRandomPrompt,
  canvas,
  socket,
  clearBtn,
  redBtn,
  blueBtn,
  greenBtn,
  blackBtn,
  shareCode,
  joinCode,
  connections,
  joinBtn,
  joinContainer,
  connectBtn,
  createRoomBtn,
  roomCode,
  clashBtn,
  localBtn,
  collabBtn,
  timerDisplay,
  winnerDisplay,
  scoreDisplay,
  guessInput,
  guessBtn,
  guessesList,
  promptDisplay,
  playersList,
  colorPicker,
  ctx,
  drawing,
  room,
  mode,
  loadLocalDrawings,
  switchToClashMode,
  switchToLocalMode,
  switchToCollabMode,
  createRoom,
  joinRoom,
  startRound,
  endRound,
  clearCanvas,
  saveLocalDrawings,
  timer,
  roundActive,
  currentPlayer,
  currentPrompt,
  guesses,
  scores,
  players,
};
