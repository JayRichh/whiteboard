import * as elementRefs from "./elementReferences.js";
import {
  init,
  draw,
  saveLocalDrawings,
  loadLocalDrawings,
  createRoom,
  joinRoom,
  startRound,
  endRound,
  switchMode,
  drawWithColorAndStroke,
} from "./main.js";

const colorToHex = {
  red: "#ff0000",
  blue: "#0000ff",
  green: "#00ff00",
  black: "#000000",
};

let {
  canvasElement,
  ctx,
  socket,
  room,
  guessInput,
  guessBtn,
  strokeSizeSlider,
  strokeTypeDropdown,
  gameStartBtn,
  gameEndBtn,
  playerNameInput,
  localBtn,
  collabBtn,
  clashBtn,
  createRoomBtn,
  joinBtn,
  clearBtn,
  redBtn,
  blueBtn,
  greenBtn,
  blackBtn,
  scores,
  currentPlayer,
  scoreDisplay,
  promptDisplay,
  winnerDisplay,
  mode,
  drawPoints,
  joinContainer,
  roomCode,
  shareCode,
  drawing,
  joinCode,
  connectBtn,
  connections,
  roundActive,
  currentPrompt,
  guesses,
  colorPicker,
} = elementRefs;

// Canvas Drawing
canvasElement.addEventListener("mousedown", init);
canvasElement.addEventListener("mousemove", draw);
canvasElement.addEventListener("mouseup", () => {
  drawing = false;
  if (mode === "local") {
    saveLocalDrawings();
  }
});

// Clear
clearBtn.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  drawPoints = [];
  localStorage.removeItem("drawPoints");
  saveLocalDrawings();
});

// Color
colorPicker.onChange((color) => {
  ctx.strokeStyle = color;
  localStorage.setItem("color", color);
});
redBtn.addEventListener("click", () => {
  colorPicker.setColor("red");
  ctx.strokeStyle = colorPicker.getHexString();
  localStorage.setItem("color", colorPicker.getHexString());
});

blueBtn.addEventListener("click", () => {
  colorPicker.setColor("blue");
  ctx.strokeStyle = colorPicker.getHexString();
  localStorage.setItem("color", colorPicker.getHexString());
});

greenBtn.addEventListener("click", () => {
  colorPicker.setColor("green");
  ctx.strokeStyle = colorPicker.getHexString();
  localStorage.setItem("color", colorPicker.getHexString());
});

blackBtn.addEventListener("click", () => {
  colorPicker.setColor("black");
  ctx.strokeStyle = colorPicker.getHexString();
  localStorage.setItem("color", colorPicker.getHexString());
});

strokeSizeSlider.addEventListener("change", () => {
  ctx.lineWidth = strokeSizeSlider.value;
  localStorage.setItem("strokeSize", strokeSizeSlider.value);
});

strokeTypeDropdown.addEventListener("change", () => {
  ctx.lineCap = strokeTypeDropdown.value;
  localStorage.setItem("strokeType", strokeTypeDropdown.value);
});

localBtn.addEventListener("click", () => switchMode("local"));
collabBtn.addEventListener("click", () => switchMode("collab"));
clashBtn.addEventListener("click", () => switchMode("clash"));

// Room Creation and Joining
createRoomBtn.addEventListener("click", createRoom);
joinBtn.addEventListener("click", () => joinRoom(joinCode.value));

guessBtn.addEventListener("click", () => {
  const guess = guessInput.value;
  if (guess.trim() !== "") {
    socket.emit("submitGuess", { room, guess });
  }
});

// Game Start/End Logic
gameStartBtn.addEventListener("click", startRound);
gameEndBtn?.addEventListener("click", endRound);

playerNameInput.addEventListener("input", (e) => {
  const playerName = e.target.value;
  if (playerName.trim() !== "") {
    socket.emit("updatePlayerName", { room, playerName });
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

window.onload = () => {
  setTimeout(() => {
    mode = localStorage.getItem("mode") || "local";
    switchMode(mode);
    loadLocalDrawings();
    if (mode === "local") {
      drawPoints.forEach((point) => drawWithColorAndStroke(point));

      const savedStrokeColor = localStorage.getItem("strokeColor");
      if (savedStrokeColor) {
        ctx.strokeStyle = savedStrokeColor;
        colorPicker.setColor(
          savedStrokeColor.charAt(0) === "#"
            ? savedStrokeColor
            : colorToHex[savedStrokeColor],
        );
      }

      const savedStrokeSize = localStorage.getItem("strokeSize");
      if (savedStrokeSize) {
        ctx.lineWidth = savedStrokeSize;
        strokeSizeSlider.value = savedStrokeSize;
      }

      const savedStrokeType = localStorage.getItem("strokeType");
      if (savedStrokeType) {
        ctx.lineCap = savedStrokeType;
        strokeTypeDropdown.value = savedStrokeType;
      }

      const savedPlayerName = localStorage.getItem("playerName");
      if (savedPlayerName) {
        socket.emit("updatePlayerName", { room, playerName: savedPlayerName });
      }

      const savedScore = localStorage.getItem("score");
      if (savedScore) {
        scores[currentPlayer] = savedScore;
        scoreDisplay.textContent = scores[currentPlayer];
      }
    }
  }, 100);
};

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

gameStartBtn.addEventListener("click", () => {
  socket.emit("startGame", { room });
});

gameEndBtn?.addEventListener("click", () => {
  socket.emit("endGame", { room });
});

window.addEventListener("startRound", startRound);
window.addEventListener("endRound", endRound);
