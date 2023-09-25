// Canvas
export let canvasElement = document.querySelector("#my-canvas");
export let ctx = canvasElement.getContext("2d");

// Socket
export let socket = io();

// Button
export let clearBtn = document.querySelector("#clear-btn");
export let redBtn = document.querySelector("#red-btn");
export let blueBtn = document.querySelector("#blue-btn");
export let greenBtn = document.querySelector("#green-btn");
export let blackBtn = document.querySelector("#black-btn");
export let joinBtn = document.querySelector("#join-btn");
export let connectBtn = document.querySelector("#join-room-btn");
export let createRoomBtn = document.querySelector("#create-room-btn");
export let clashBtn = document.querySelector("#clash-btn");
export let localBtn = document.querySelector("#local-btn");
export let collabBtn = document.querySelector("#collab-btn");
export let guessBtn = document.querySelector("#submit-guess-btn");
export let gameStartBtn = document.querySelector("#game-start-btn");
export let gameEndBtn = document.querySelector("#game-end-btn");

// Input
export let colorPicker = new Pickr({
  el: "#color-picker",
  theme: "classic",
  default: localStorage.getItem("color") || "#000000",
  swatches: [
    "rgba(244, 67, 54, 1)",
    "rgba(233, 30, 99, 0.95)",
    "rgba(156, 39, 176, 0.9)",
    "rgba(103, 58, 183, 0.85)",
    "rgba(63, 81, 181, 0.8)",
    "rgba(33, 150, 243, 0.75)",
    "rgba(3, 169, 244, 0.7)",
    "rgba(0, 188, 212, 0.7)",
    "rgba(0, 150, 136, 0.75)",
    "rgba(76, 175, 80, 0.8)",
    "rgba(139, 195, 74, 0.85)",
    "rgba(205, 220, 57, 0.9)",
    "rgba(255, 235, 59, 0.95)",
    "rgba(255, 193, 7, 1)",
  ],
  components: {
    preview: true,
    opacity: true,
    hue: true,
    interaction: {
      hex: true,
      rgba: true,
      hsla: false,
      hsva: false,
      cmyk: false,
      input: true,
      clear: false,
      save: true,
    },
  },
});
export let shareCode = document.querySelector("#connect-code");
export let joinCode = document.querySelector("#join-code");
export let guessInput = document.querySelector("#guess-input");
export let playerNameInput = document.querySelector("#player-name-input");
export let strokeSizeSlider = document.querySelector("#stroke-size-slider");
export let strokeTypeDropdown = document.querySelector("#stroke-type-dropdown");

// Display
export let connections = document.querySelector("#connections");
export let joinContainer = document.querySelector(".join-container");
export let roomCode = document.querySelector("#room-code");
export let timerDisplay = document.querySelector("#timer");
export let winnerDisplay = document.querySelector("#winner");
export let scoreDisplay = document.querySelector("#score");
export let guessesList = document.querySelector("#guesses-list");
export let promptDisplay = document.querySelector("#prompt");
export let playersList = document.querySelector("#players-list");

// Setup
canvasElement.style.height = window.innerHeight + "px";
canvasElement.style.width = window.innerWidth + "px";
canvasElement.height = window.innerHeight;
canvasElement.width = window.innerWidth;

// Game Variables
export let drawing = false;
export let x1, y1;
export let room = null;
export let mode = "local";
export let drawPoints = [];
export let timer = null;
export let roundActive = false;
export let currentPlayer = null;
export let currentPrompt = null;
export let guesses = [];
export let scores = {};
export let players = [];
