// Elements
export let canvasElement = document.querySelector("#my-canvas");
export let socket = io();
export let clearBtn = document.querySelector("#clear-btn");
export let redBtn = document.querySelector("#red-btn");
export let blueBtn = document.querySelector("#blue-btn");
export let greenBtn = document.querySelector("#green-btn");
export let blackBtn = document.querySelector("#black-btn");
export let colorPicker = document.querySelector("#color-picker");
export let shareCode = document.querySelector("#connect-code");
export let joinCode = document.querySelector("#join-code");
export let connections = document.querySelector("#connections");
export let joinBtn = document.querySelector("#join-btn");
export let joinContainer = document.querySelector(".join-container");
export let connectBtn = document.querySelector("#join-room-btn");
export let createRoomBtn = document.querySelector("#create-room-btn");
export let roomCode = document.querySelector("#room-code");
export let clashBtn = document.querySelector("#clash-btn");
export let localBtn = document.querySelector("#local-btn");
export let collabBtn = document.querySelector("#collab-btn");
export let timerDisplay = document.querySelector("#timer");
export let winnerDisplay = document.querySelector("#winner");
export let scoreDisplay = document.querySelector("#score");
export let guessInput = document.querySelector("#guess-input");
export let guessBtn = document.querySelector("#submit-guess-btn");
export let guessesList = document.querySelector("#guesses-list");
export let promptDisplay = document.querySelector("#prompt");
export let playersList = document.querySelector("#players-list");
export let gameStartBtn = document.querySelector("#game-start-btn");
export let gameEndBtn = document.querySelector("#game-end-btn");
export let playerNameInput = document.querySelector("#player-name-input");
export let strokeSizeSlider = document.querySelector("#stroke-size-slider");
export let strokeTypeDropdown = document.querySelector("#stroke-type-dropdown");

// Setup
canvasElement.style.height = window.innerHeight + "px";
canvasElement.style.width = window.innerWidth + "px";
canvasElement.height = window.innerHeight;
canvasElement.width = window.innerWidth;
export const ctx = canvasElement.getContext("2d");

// Variables
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
