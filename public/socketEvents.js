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
} = elementRefs;

socket.on("draw", (data) => {
  const point = {
    x1: data.x1,
    y1: data.y1,
    x2: data.x2,
    y2: data.y2,
    color: data.color,
  };
  drawOnCanvas(point);
  if (roundActive) {
    drawPoints.push(point);
  }
});

socket.on("clear", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPoints = [];
});

socket.on("startRound", (data) => {
  roundActive = true;
  currentPlayer = data.drawer;
  currentPrompt = data.prompt;
  timer = 120;
  guesses = [];
  displayPrompt(currentPrompt);
  updateTimer();
});

socket.on("endRound", (data) => {
  roundActive = false;
  const winner = determineWinner();
  updateScore(winner);
  clearCanvas();
  resetTimer();
});

socket.on("updateScore", (data) => {
  scores = data.scores;
  scoreDisplay.textContent = scores[currentPlayer];
});

socket.on("updatePlayers", (data) => {
  players = data.players;
  connections.textContent = players.length;
  updatePlayerList(players);
});

socket.on("playerLeft", (data) => {
  players = players.filter((player) => player !== data.player);
  connections.textContent = players.length;
  updatePlayerList(players);
});

socket.on("playerJoined", (data) => {
  players.push(data.player);
  connections.textContent = players.length;
  updatePlayerList(players);
});

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

socket.on("submitGuess", (data) => {
  guesses.push(data.guess);
  updateGuessesList(guesses);
});

socket.on("updateGuesses", (data) => {
  guesses = data.guesses;
  updateGuessesList(guesses);
  guessesList.innerHTML = "";
  data.guesses.forEach((guess) => {
    const guessElement = document.createElement("li");
    guessElement.textContent = guess;
    guessesList.appendChild(guessElement);
  });
});

socket.on("selectDrawer", (data) => {
  currentPlayer = data.drawer;
  currentPrompt = data.prompt;
  displayPrompt(currentPrompt);
});

socket.on("initializeRound", (data) => {
  currentPlayer = data.drawer;
  currentPrompt = data.prompt;
  startRound();
});

socket.on("concludeRound", (data) => {
  endRound();
  scores = data.scores;
  updateScore(currentPlayer);
});

socket.on("playerDisconnected", (data) => {
  players = players.filter((player) => player !== data.player);
  connections.textContent = players.length;
  updatePlayerList(players);
});

socket.on("updateScore", (data) => {
  scores = data.scores;
  scoreDisplay.textContent = scores["me"]; // Replace the actual player ID
});

socket.on("updatePlayers", (data) => {
  players = data.players;
  connections.textContent = players.length;
});

socket.on("playerLeft", (data) => {
  players = players.filter((player) => player !== data.player);
  connections.textContent = players.length;
  roomCode.textContent = `Room: ${data.room}`;
});

socket.on("playerJoined", (data) => {
  players.push(data.player);
  connections.textContent = players.length;
  roomCode.textContent = `Room: ${data.room}`;
});

socket.on("updatePlayerList", (data) => {
  playersList.innerHTML = "";
  data.players.forEach((player) => {
    const playerElement = document.createElement("li");
    playerElement.textContent = `${player.name}: ${player.score}`;
    playersList.appendChild(playerElement);
  });
});

socket.on("updatePrompt", (data) => {
  promptDisplay.textContent = data.prompt;
});

socket.on("updateTimer", (data) => {
  timerDisplay.textContent = data.timer || data.time;
});

socket.on("updateWinner", (data) => {
  winnerDisplay.textContent = data.winner;
});

socket.on("updateCurrentPlayer", (data) => {
  currentPlayer = data.player;
});
