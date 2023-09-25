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
  updateDisplayFromLocalStorage,
  setColorAndSave,
} from "./main.js";

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
canvasElement.addEventListener("touchstart", (e) => {
  const rect = canvasElement.getBoundingClientRect();
  const x = e.touches[0].clientX - rect.left;
  const y = e.touches[0].clientY - rect.top;
  startDrawing(x, y);
});
canvasElement.addEventListener("touchmove", (e) => {
  const rect = canvasElement.getBoundingClientRect();
  const x = e.touches[0].clientX - rect.left;
  const y = e.touches[0].clientY - rect.top;
  draw(x, y);
});
canvasElement.addEventListener("touchend", () => {
  stopDrawing();
});

// Clear
clearBtn.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  drawPoints = [];
  localStorage.removeItem("drawPoints");
  saveLocalDrawings();
});

// Color
redBtn.addEventListener("click", () =>
  setColorAndSave("rgba(255, 0, 0, 1, 1)"),
);
blueBtn.addEventListener("click", () =>
  setColorAndSave("rgba(0, 0, 255, 1, 1)"),
);
greenBtn.addEventListener("click", () =>
  setColorAndSave("rgba(0, 255, 0, 1, 1)"),
);
blackBtn.addEventListener("click", () =>
  setColorAndSave("rgba(0, 0, 0, 1, 1)"),
);

strokeSizeSlider.addEventListener("change", () => {
  ctx.lineWidth = strokeSizeSlider.value;
  localStorage.setItem("strokeSize", strokeSizeSlider.value);
});

strokeTypeDropdown.addEventListener("change", () => {
  ctx.lineCap = strokeTypeDropdown.value;
  localStorage.setItem("strokeType", strokeTypeDropdown.value);
});

window.onload = () => {
  mode = localStorage.getItem("mode") || "local";
  switchMode(mode);
  loadLocalDrawings();
  updateDisplayFromLocalStorage();
  if (mode === "local") {
    drawPoints.forEach((point) => drawWithColorAndStroke(point));

    const savedStrokeColor = localStorage.getItem("color");
    if (savedStrokeColor) {
      ctx.strokeStyle = savedStrokeColor;
      if (colorPicker) {
        colorPicker.setColor(savedStrokeColor);
      } else {
        console.error("colorPicker is not initialized");
      }
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

  colorPicker.on("init", (instance) => {
    const { result } = instance.getRoot().interaction;
    result.addEventListener(
      "keydown",
      (e) => {
        if (e.key === "Enter") {
          instance.applyColor();
          instance.hide();
        }
      },
      { capture: true },
    );
  });

  let isChangingColor = false;

  colorPicker.on("save", (color, instance) => {
    if (!isChangingColor) {
      try {
        const rgbaColor = color.toRGBA().toString();
        ctx.strokeStyle = rgbaColor;
        localStorage.setItem("color", rgbaColor);
      } catch (error) {
        console.error("Error saving color: ", error);
      }
    }
  });

  colorPicker.on("change", (color, source, instance) => {
    if (!isChangingColor) {
      isChangingColor = true;
      try {
        const rgbaColor = color.toRGBA().toString();
        if (source === "input" || source === "slider" || source === "swatch") {
          ctx.strokeStyle = rgbaColor;
          localStorage.setItem("color", rgbaColor);
        }
      } catch (error) {
        console.error("Error changing color: ", error);
      }
      isChangingColor = false;
    }
  });
};

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
