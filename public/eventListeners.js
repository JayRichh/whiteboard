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
  utilSelected,
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
  eraseBtn,
  undoBtn,
  redoBtn,
  utilitiesBtn,
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

// Utilities Popout

// utilitiesBtn.addEventListener("click", () => {
//   let utilitiesPopout = document.querySelector(".utilities-container");
//   utilitiesPopout.classList.toggle("active");
//   let utilityButtons = utilitiesPopout.querySelectorAll(".btn");
//   utilityButtons.forEach((button) => {
//     button.style.display = utilitiesPopout.classList.contains("active")
//       ? "block"
//       : "none";
//   });
// });
// click away from popout
// window.addEventListener("click", function (e) {
//   if (!document.querySelector(".utilities-container").contains(e.target)) {
//     let utilitiesPopout = document.querySelector(".utilities-container");
//     utilitiesPopout.classList.remove("active");
//     let utilityButtons = utilitiesPopout.querySelectorAll(".btn");
//     utilityButtons.forEach((button) => {
//       button.style.display = "none";
//     });
//   }
// });

// Undo/Redo
let undoStack = [];
let redoStack = [];

undoBtn.addEventListener("click", () => {
  if (drawPoints.length) {
    redoStack.push(drawPoints.pop());
    redrawCanvas();
  }
  utilitiesBtn.innerHTML = "Utilities<br>Undo";
  undoBtn.innerHTML = undoBtn?.innerHTML ? "✓ Undo" : "Undo";
  redoBtn.innerHTML = "Redo";
  clearBtn.innerHTML = "Clear";
  eraseBtn.innerHTML = "Eraser";
  document.querySelector(".utilities-container").classList.remove("active");
});

redoBtn.addEventListener("click", () => {
  if (redoStack.length) {
    drawPoints.push(redoStack.pop());
    redrawCanvas();
  }
  utilitiesBtn.innerHTML = "Utilities<br>Redo";
  redoBtn.innerHTML = redoBtn?.innerHTML ? "✓ Redo" : "Redo";
  undoBtn.innerHTML = "Undo";
  clearBtn.innerHTML = "Clear";
  eraseBtn.innerHTML = "Eraser";
  document.querySelector(".utilities-container").classList.remove("active");
});

clearBtn.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  localStorage.setItem("drawPoints", JSON.stringify([]));
  drawPoints = [];
  localStorage.clear();
  utilitiesBtn.innerHTML = "Utilities<br>Clear";
  clearBtn.innerHTML = clearBtn?.innerHTML ? "✓ Clear" : "Clear";
  undoBtn.innerHTML = "Undo";
  redoBtn.innerHTML = "Redo";
  eraseBtn.innerHTML = "Eraser";
  document.querySelector(".utilities-container").classList.remove("active");
});

eraseBtn?.addEventListener("click", () => {
  ctx.globalCompositeOperation = "destination-out";
  ctx.lineWidth = strokeSizeSlider.value;
  utilitiesBtn.innerHTML = "Utilities<br>Eraser";
  eraseBtn.innerHTML = eraseBtn?.innerHTML ? "✓ Eraser" : "Eraser";
  undoBtn.innerHTML = "Undo";
  redoBtn.innerHTML = "Redo";
  clearBtn.innerHTML = "Clear";
  document.querySelector(".utilities-container").classList.remove("active");
});

// Clear
clearBtn.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  localStorage.setItem("drawPoints", JSON.stringify([]));
  drawPoints = [];
  localStorage.clear();
  // saveLocalDrawings();
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
  drawPoints?.forEach((point) => drawWithColorAndStroke(point));
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
createRoomBtn.addEventListener("click", () => {
  createRoom();
  const connectCode = document.querySelector("#connect-code");
  const joinCode = document.querySelector("#join-code");
  const joinBtn = document.querySelector("#join-btn");
  if (connectCode) {
    connectCode.style.display =
      connectCode.style.display === "none" ? "block" : "none";
    connectCode.style.transition = "display 0.5s";
  }
  if (joinCode) joinCode.style.display = "none";
  if (joinBtn) joinBtn.style.display = "none";
});
joinBtn.addEventListener("click", () => {
  joinRoom();
  const joinCode = document.querySelector("#join-code");
  const connectCode = document.querySelector("#connect-code");
  const connectBtn = document.querySelector("#connect-btn");
  if (joinCode) {
    joinCode.style.display =
      joinCode.style.display === "none" ? "block" : "none";
    joinCode.style.transition = "display 0.5s";
  }
  if (connectCode) connectCode.style.display = "none";
  if (connectBtn) connectBtn.style.display = "none";
});
shareCode.addEventListener("keyup", () => {
  const connectBtn = document.querySelector("#connect-btn");
  if (connectBtn) {
    connectBtn.style.display = shareCode.value.length != 0 ? "block" : "none";
    connectBtn.style.transition = "display 0.5s";
  }
  if (shareCode.value.length > 0) {
    const joinCode = document.querySelector("#join-code");
    const joinBtn = document.querySelector("#join-btn");
    if (joinCode) joinCode.style.display = "none";
    if (joinBtn) joinBtn.style.display = "none";
  }
});
joinCode.addEventListener("keyup", () => {
  const joinBtn = document.querySelector("#join-btn");
  if (joinBtn) {
    joinBtn.style.display = joinCode.value.length != 0 ? "block" : "none";
    joinBtn.style.transition = "display 0.5s";
  }
  if (joinCode.value.length > 0) {
    const shareCode = document.querySelector("#share-code");
    const connectBtn = document.querySelector("#connect-btn");
    if (shareCode) shareCode.style.display = "none";
    if (connectBtn) connectBtn.style.display = "none";
  }
});
document.querySelector("#connect-btn").addEventListener("click", () => {
  const connectCode = document.querySelector("#connect-code");
  console.log(connectCode.value);
  if (connectCode.value.length > 1) {
    try {
      console.log("create room");
      createRoom();
      connectCode.style.display = "none";
      connectBtn.style.display = "none";
    } catch (error) {
      console.warn("Failed to create room: ", error);
    }
  }
});
document.querySelector("#join-btn").addEventListener("click", () => {
  const joinCode = document.querySelector("#join-code");
  console.log(joinCode.value);
  if (joinCode.value.length > 1) {
    try {
      console.log("join room");
      joinRoom();
      joinCode.style.display = "none";
      document.querySelector("#join-btn").style.display = "none";
    } catch (error) {
      console.warn("Failed to join room: ", error);
    }
  }
});
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
    // Decrease score
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

let utilitiesMenu = document.querySelector("#utilities-popout");
// WINDOW EVENTS
window.addEventListener("click", function (e) {
  if (
    !document.querySelector(".utilities-container").contains(e.target) &&
    !e.target.classList.contains("utility-option") &&
    e.target.id !== "utilities-btn" 
  ) {
    utilitiesMenu.style.display = "none";
    utilityOptions.forEach((option) => {
      option.style.display = "none";
    });
  }
});

// let utilitiesBtn = document.querySelector("#utilities-btn");
utilitiesBtn.addEventListener("click", () => {
  let utilityOptions = document.querySelector(".utility-options");
  if (utilitiesMenu.style.display === "none") {
    utilitiesMenu.style.display = "block";
    utilityOptions.style.transform = "scale(1)";
  } else {
    utilitiesMenu.style.display = "none";
    utilityOptions.style.transform = "scale(0)";
  }
});

// let utilityOptions = document.querySelectorAll(".utility-option");

// utilityOptions.forEach((option) => {
//   option.addEventListener("click", () => {
//     utilitiesBtn.textContent = option.textContent;
//     utilitiesMenu.style.display = "none";
//   });
// });
