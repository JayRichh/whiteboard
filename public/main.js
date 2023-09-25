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
  redBtn,
  blueBtn,
  greenBtn,
  blackBtn,
  strokeSizeSlider,
  playerNameInput,
  gameEndBtn,
} = elementRefs;

let players = [];
let canvas = canvasElement;

const init = (e) => {
  x1 = e.offsetX;
  y1 = e.offsetY;
  drawing = e.buttons === 1;
};
// Draw & Utilities
const draw = (e) => {
  if (!drawing || e.buttons !== 1) return;
  const point = {
    x1,
    y1,
    x2: e.offsetX,
    y2: e.offsetY,
    color: colorPicker.getColor().toRGBA().toString(),
    size: ctx.lineWidth,
    type: ctx.lineCap,
  };
  drawOnCanvas(point);
  if (mode === "local") {
    drawPoints.push(point);
    saveLocalDrawings();
  } else if (mode === "collab" && room) {
    socket.emit("draw", { ...point, room });
  }
  x1 = e.offsetX;
  y1 = e.offsetY;
};

export const setColorAndSave = (rgbaString) => {
  colorPicker.setColor(rgbaString);
  ctx.strokeStyle = rgbaString;
  localStorage.setItem("color", rgbaString);
};

const drawWithColorAndStroke = (point) => {
  ctx.beginPath();
  ctx.moveTo(point.x1, point.y1);
  ctx.lineTo(point.x2, point.y2);
  ctx.strokeStyle = point.color;
  ctx.lineWidth = point.size;
  ctx.lineCap = point.type;
  ctx.stroke();
  ctx.closePath();
};

const drawOnCanvas = (point) => {
  ctx.beginPath();
  ctx.moveTo(point.x1, point.y1);
  ctx.lineTo(point.x2, point.y2);
  ctx.strokeStyle = point.color;
  ctx.lineWidth = point.size;
  ctx.lineCap = point.type;
  ctx.stroke();
  ctx.closePath();
};
const clearCanvas = () => ctx.clearRect(0, 0, canvas.width, canvas.height);
const saveLocalDrawings = () =>
  localStorage.setItem("drawPoints", JSON.stringify(drawPoints));
const loadLocalDrawings = () => {
  return new Promise((resolve, reject) => {
    const savedDrawPoints = JSON.parse(localStorage.getItem("drawPoints"));
    if (savedDrawPoints && savedDrawPoints.length > 0) {
      drawPoints = savedDrawPoints;
      drawPoints.forEach((point) => drawOnCanvas(point));
      const lastPointColor = drawPoints[drawPoints.length - 1].color;
      if (lastPointColor) {
        ctx.strokeStyle = lastPointColor;
        if (colorPicker) {
          try {
            if (
              typeof lastPointColor === "string" &&
              lastPointColor.startsWith("rgba")
            ) {
              colorPicker.setColor(lastPointColor);
            } else if (
              typeof lastPointColor === "object" &&
              lastPointColor.hasOwnProperty("h") &&
              lastPointColor.hasOwnProperty("s") &&
              lastPointColor.hasOwnProperty("v") &&
              lastPointColor.hasOwnProperty("a")
            ) {
              colorPicker.setColor(
                `hsva(${lastPointColor.h}, ${lastPointColor.s}, ${lastPointColor.v}, ${lastPointColor.a})`,
              );
            } else {
              console.error("Invalid color format: ", lastPointColor);
            }
          } catch (error) {
            console.error("Error setting colorPicker color: ", error);
          }
        } else {
          console.error("colorPicker is not initialized");
        }
      }
      resolve();
    } else {
      reject("No drawPoints found in local storage.");
    }
  });
};
const updateDisplayFromLocalStorage = () => {
  const score = localStorage.getItem("score");
  const playerName = localStorage.getItem("playerName");
  const roomCode = localStorage.getItem("roomCode");
  const drawPoints = JSON.parse(localStorage.getItem("drawPoints"));
  const strokeType = localStorage.getItem("strokeType");
  const strokeSize = localStorage.getItem("strokeSize");
  const savedColor = localStorage.getItem("color");
  if (score) scoreDisplay.textContent = score;
  if (playerName) playerNameInput.value = playerName;
  if (roomCode) joinCode.value = roomCode;
  if (mode) switchMode(localStorage.getItem("mode"));
  if (drawPoints) drawPoints.forEach((point) => drawWithColorAndStroke(point));
  if (savedColor) {
    if (colorPicker) {
      colorPicker.setColor(savedColor);
    } else {
      console.error("colorPicker is not initialized");
    }
    ctx.strokeStyle = savedColor;
    [redBtn, blueBtn, greenBtn, blackBtn].forEach((btn) =>
      btn.classList.remove("active"),
    );
    switch (savedColor) {
      case "rgba(255, 0, 0, 1)":
        redBtn.classList.add("active");
        break;
      case "rgba(0, 0, 255, 1)":
        blueBtn.classList.add("active");
        break;
      case "rgba(0, 128, 0, 1)":
        greenBtn.classList.add("active");
        break;
      case "rgba(0, 0, 0, 1)":
        blackBtn.classList.add("active");
        break;
    }
  }

  if (strokeType) {
    strokeTypeDropdown.value = strokeType;
  }

  if (strokeSize) {
    strokeSizeSlider.value = strokeSize;
  }
};

// GAME LOGIC
const switchToLocalMode = async () => {
  mode = "local";
  localBtn.classList.add("active");
  collabBtn.classList.remove("active");
  clashBtn.classList.remove("active");
  createRoomBtn.style.display = "none";
  joinContainer.style.display = "none";
  await loadLocalDrawings().then(() => {
    drawPoints.forEach((point) => drawWithColorAndStroke(point));
  });
};

const switchToCollabMode = () => {
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
};

const switchToClashMode = () => {
  mode = "clash";
  drawPoints = [];
  clashBtn.classList.add("active");
  localBtn.classList.remove("active");
  collabBtn.classList.remove("active");
  createRoomBtn.style.display = "block";
  clearCanvas();
  joinContainer.style.display = "block";
};

const switchMode = (newMode) => {
  const modeSwitch = {
    local: switchToLocalMode,
    collab: switchToCollabMode,
    clash: switchToClashMode,
  };
  if (newMode && modeSwitch[newMode]) modeSwitch[newMode]();
};

const createRoom = () => {
  socket.emit("createRoom");
};

const joinRoom = (roomCode) => {
  socket.emit("joinRoom", roomCode);
};

const startRound = () => {
  roundActive = true;
  currentPlayer = selectRandomPlayer();
  currentPrompt = selectRandomPrompt();
  timer = 120;
  guesses = [];
  displayPrompt(currentPrompt);
  updateTimer();
  socket.emit("startRound", { room });
};

const endRound = () => {
  roundActive = false;
  const winner = determineWinner();
  updateScore(winner);
  clearCanvas();
  resetTimer();
  socket.emit("endRound", { room });
};

const selectRandomPlayer = () =>
  players[Math.floor(Math.random() * players.length)];

const selectRandomPrompt = () => {
  const prompts = ["house", "horse", "car", "tree"];
  return prompts[Math.floor(Math.random() * prompts.length)];
};

const displayPrompt = (prompt) => {
  if (currentPlayer === "me") {
    promptDisplay.textContent = prompt;
  }
};

const determineWinner = () => {
  let winner = null;
  guesses.forEach((guess) => {
    if (guess === currentPrompt) {
      winner = currentPlayer;
      return;
    }
  });
  return winner;
};

const updateScore = (winner) => {
  if (winner) {
    if (winner === currentPlayer) {
      players.forEach((player) => {
        if (player.id === winner) {
          player.score += 10;
        }
      });
    }
  } else {
    players.forEach((player) => {
      if (player.id === currentPlayer) {
        player.score -= 5;
      }
    });
  }
  saveLocalScores();
};

const saveLocalScores = () => {
  const scoreData = players.map((player) => {
    return { id: player.id, score: player.score };
  });
  localStorage.setItem("scores", JSON.stringify(scoreData));
};

export {
  init,
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
  draw,
  drawWithColorAndStroke,
  updateDisplayFromLocalStorage,
  switchMode,
  determineWinner,
  updateScore,
  saveLocalScores,
};
