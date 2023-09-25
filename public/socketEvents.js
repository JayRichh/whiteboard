import * as elementRefs from "./elementReferences.js";

let {
  socket,
  scoreDisplay,
  connections,
  playersList,
  timerDisplay,
  winnerDisplay,
  guessesList,
  promptDisplay,
  drawOnCanvas,
  hashScore,
  colorPicker,
} = elementRefs;

let players = [];
let scores = {};
let currentPlayer = null;
let currentPrompt = "";
let guesses = [];
let timer = null;
let roundActive = false;

// Drawing, Rounds, and Canvas Operations
socket.on("draw", (data) => {
  const point = {
    x1: data.x1,
    y1: data.y1,
    x2: data.x2,
    y2: data.y2,
    color: data.color,
  };
  drawOnCanvas(point);
  colorPicker.setColor(data.color);
});

socket.on("clear", () => {
  clearCanvas();
  drawPoints = [];
});

socket.on("startRound", (data) => {
  if (data.room === room) {
    startRound();
  }
});

socket.on("endRound", (data) => {
  if (data.room === room) {
    endRound();
  }
});

// Player Management & Score
socket.on("updateScores", (data) => {
  if (data.room === room) {
    players = data.scores;
    updateDisplayFromLocalStorage();
  }
});

socket.on("updatePlayers", (data) => {
  players = data.players;
  connections.textContent = players.length;
  updatePlayerList(players);
});

socket.on("playerDisconnected", (data) => {
  players = players.filter((player) => player !== data.player);
  connections.textContent = players.length;
  updatePlayerList(players);
});

// Prompts, Timers, and Winnesrs
socket.on("updatePrompt", (data) => {
  currentPrompt = data.prompt;
  promptDisplay.textContent = currentPrompt;
});

socket.on("updateTimer", (data) => {
  timer = data.timer;
  timerDisplay.textContent = timer;
});

socket.on("updateWinner", (data) => {
  winnerDisplay.textContent = data.winner;
});

// Guessing, Scoring, Winning, Penalties
socket.on("submitGuess", (data) => {
  guesses.push(data.guess);
  updateGuessesList(guesses);
});

socket.on("penalizeDrawer", () => {
  penalizeDrawer();
});

socket.on("initializeClashMode", () => {
  initializeClashMode();
});
