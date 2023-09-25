import * as SimpleColorPicker from "../../node_modules/simple-color-picker/dist/simple-color-picker.umd.js";

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
export let colorPicker = new ColorPicker({
  color: localStorage.getItem("color") || "#FF0000",
  el: document.querySelector("#color-picker"),
});
colorPicker.el.style.width = "200px";
colorPicker.el.style.height = "200px";
colorPicker.window = document.getElementsByTagName("iframe")[0].contentWindow;
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
