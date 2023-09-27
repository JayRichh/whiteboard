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

socket.on("roomCreated", (data) => {
  console.log(`Room ${data.room} created.`);
  room = data.room;
});

socket.on("roomJoined", (data) => {
  console.log(`Joined room ${data.room}.`);
  room = data.room;
});

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

const drawWithColorAndStroke = ({ x1, y1, x2, y2, color, size, type }) => {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = size;
  ctx.lineCap = type;
  ctx.stroke();
  ctx.closePath();
};

const drawOnCanvas = (point) => {
  drawWithColorAndStroke(point);
  if (drawPoints.length > 1000) drawPoints.shift();
  drawPoints.push(point);
};

const clearCanvas = () => ctx.clearRect(0, 0, canvas.width, canvas.height);

const saveLocalDrawings = () => {
  if (drawPoints.length > 0)
    localStorage.setItem("drawPoints", JSON.stringify(drawPoints));
};

const loadLocalDrawings = async () => {
  const savedDrawPoints = JSON.parse(localStorage.getItem("drawPoints"));
  if (savedDrawPoints && savedDrawPoints.length > 0) {
    drawPoints = savedDrawPoints;
    drawPoints.forEach(drawOnCanvas);
    const lastPointColor = drawPoints[drawPoints.length - 1].color;
    if (lastPointColor) {
      ctx.strokeStyle = lastPointColor;
      if (colorPicker) colorPicker.setColor(lastPointColor);
    }
  }
};

const updateDisplayFromLocalStorage = () => {
  const [
    score,
    playerName,
    roomCode,
    drawPoints,
    strokeType,
    strokeSize,
    savedColor,
  ] = [
    "score",
    "playerName",
    "roomCode",
    "drawPoints",
    "strokeType",
    "strokeSize",
    "color",
  ].map((item) => localStorage.getItem(item));

  if (score) scoreDisplay.textContent = score;
  if (playerName) playerNameInput.value = playerName;
  if (roomCode) joinCode.value = roomCode;
  if (mode) switchMode(localStorage.getItem("mode"));
  if (drawPoints) JSON.parse(drawPoints).forEach(drawWithColorAndStroke);
  if (savedColor) {
    if (colorPicker) colorPicker.setColor(savedColor);
    ctx.strokeStyle = savedColor;
    [redBtn, blueBtn, greenBtn, blackBtn].forEach((btn) =>
      btn.classList.remove("active"),
    );
    const colorBtns = {
      "rgba(255, 0, 0, 1)": redBtn,
      "rgba(0, 0, 255, 1)": blueBtn,
      "rgba(0, 128, 0, 1)": greenBtn,
      "rgba(0, 0, 0, 1)": blackBtn,
    };
    if (colorBtns[savedColor]) colorBtns[savedColor].classList.add("active");
  }
  if (strokeType) strokeTypeDropdown.value = strokeType;
  if (strokeSize) strokeSizeSlider.value = strokeSize;
};

// GAME LOGIC
const switchMode = (newMode) => {
  const modeSwitch = {
    local: async () => {
      mode = "local";
      localBtn.classList.add("active");
      [collabBtn, clashBtn].forEach((btn) => btn.classList.remove("active"));
      createRoomBtn.style.display = "none";
      joinContainer.style.display = "none";
      await loadLocalDrawings();
      drawPoints.forEach(drawWithColorAndStroke);
    },
    collab: () => {
      mode = "collab";
      drawPoints = [];
      collabBtn.classList.add("active");
      [localBtn, clashBtn].forEach((btn) => btn.classList.remove("active"));
      [connectBtn, createRoomBtn, roomCode].forEach(
        (item) => (item.style.display = "block"),
      );
      clearCanvas();
      joinContainer.style.display = "block";
    },
    clash: () => {
      mode = "clash";
      drawPoints = [];
      clashBtn.classList.add("active");
      [localBtn, collabBtn].forEach((btn) => btn.classList.remove("active"));
      createRoomBtn.style.display = "block";
      clearCanvas();
      joinContainer.style.display = "block";
    },
  };
  if (newMode && modeSwitch[newMode]) modeSwitch[newMode]();
};

const createRoom = () => {
  const roomCodeElement = document.querySelector("#create-room-code");
  if (roomCodeElement) {
    const roomCode = roomCodeElement.value;
    if (roomCode && roomCode.length > 1) {
      socket.emit("createRoom", roomCode);
      room = roomCode;
    }
  }
};

const joinRoom = () => {
  const roomCodeElement = document.querySelector("#join-room-code");
  if (roomCodeElement) {
    const roomCode = roomCodeElement.value;
    if (roomCode && roomCode.length > 1) {
      socket.emit("joinRoom", roomCode);
      room = roomCode;
    }
  }
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
