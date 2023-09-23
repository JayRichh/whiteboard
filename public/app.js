// Element References
const canvas = document.querySelector("#my-canvas");
const socket = io();
const clearBtn = document.querySelector("#clear-btn");
const redBtn = document.querySelector("#red-btn");
const blueBtn = document.querySelector("#blue-btn");
const greenBtn = document.querySelector("#green-btn");
const blackBtn = document.querySelector("#black-btn");
const colorPicker = document.querySelector("#color-picker");
const shareCode = document.querySelector("#connect-code");
const joinCode = document.querySelector("#join-code");
const connections = document.querySelector("#connections");
const joinBtn = document.querySelector("#join-btn");
const joinContainer = document.querySelector(".join-container");
const connectBtn = document.querySelector("#join-room-btn");
const createRoomBtn = document.querySelector("#create-room-btn");
const roomCode = document.querySelector("#room-code");
const clashBtn = document.querySelector("#clash-btn");
const localBtn = document.querySelector("#local-btn");
const collabBtn = document.querySelector("#collab-btn");

// Canvas Setup
canvas.style.height = window.innerHeight + "px";
canvas.style.width = window.innerWidth + "px";
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
const ctx = canvas.getContext("2d");

// Variables
let drawing = false;
let x1, y1;
let room = null;
let mode = "local";
let drawPoints = [];

// Functions
function draw(e) {
  if (!drawing) return;
  const point = {
    x1,
    y1,
    x2: e.offsetX,
    y2: e.offsetY,
    color: ctx.strokeStyle,
  };
  drawOnCanvas(point);
  if (mode === "local") {
    drawPoints.push(point);
  } else if (mode === "collab" && room) {
    socket.emit("draw", { ...point, room });
  }
  x1 = e.offsetX;
  y1 = e.offsetY;
}

function drawOnCanvas(point) {
  ctx.beginPath();
  ctx.moveTo(point.x1, point.y1);
  ctx.lineTo(point.x2, point.y2);
  ctx.stroke();
  ctx.closePath();
  ctx.strokeStyle = point.color;
}

// Socket Events
socket.on("draw", (data) => {
  drawOnCanvas(data);
});

// Event Listeners
let buttons = document.querySelectorAll(".btn");
let activeButton = null;

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    if (activeButton) {
      activeButton.classList.remove("active");
    }
    button.classList.add("active");
    console.log(button);
    activeButton = button;
  });
});

shareCode.addEventListener("keyup", () => {
  if (shareCode.value.trim() !== "") {
    joinBtn.style.display = "block";
  } else {
    joinBtn.style.display = "none";
  }
});

joinBtn.addEventListener("click", () => {
  room = shareCode.value;
  socket.emit("join-room", room);
  loadLocalDrawings(room);
});
createRoomBtn.addEventListener("click", () => {
  room = roomCode.value;
  socket.emit("create-room", room);
});
roomCode.addEventListener("keyup", () => {
  let createBtn = document.getElementById("create-btn");
  if (roomCode.value.trim() !== "") {
    createBtn.style.display = "block";
  } else {
    createBtn.style.display = "none";
  }
});
clashBtn.addEventListener("click", () => {
  room = roomCode.value;
  socket.emit("join-room", room);
  loadLocalDrawings(room);
});
colorPicker.addEventListener("blur", (e) => {
  ctx.strokeStyle = e.target.value;
});
clearBtn.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPoints = [];
  saveLocalDrawings();
  if (room) {
    socket.emit("clear", room);
  }
});
redBtn.addEventListener("click", () => {
  ctx.strokeStyle = "#FF0000";
  colorPicker.value = "#FF0000";
});
blueBtn.addEventListener("click", () => {
  ctx.strokeStyle = "#0000FF";
  colorPicker.value = "#0000FF";
});
greenBtn.addEventListener("click", () => {
  ctx.strokeStyle = "#00FF00";
  colorPicker.value = "#00FF00";
});
blackBtn.addEventListener("click", () => {
  ctx.strokeStyle = "black";
  colorPicker.value = "#000000";
});
canvas.addEventListener("mousedown", (e) => {
  init(e);
});
canvas.addEventListener("mousemove", (e) => {
  draw(e);
});
canvas.addEventListener("mouseup", (e) => {
  drawing = false;
  if (mode === "local") {
    saveLocalDrawings();
  }
});

function init(e) {
  x1 = e.offsetX;
  y1 = e.offsetY;
  drawing = true;
}

localBtn.addEventListener("click", switchToLocalMode);
collabBtn.addEventListener("click", switchToCollabMode);
clashBtn.addEventListener("click", switchToClashMode);

createRoomBtn.addEventListener("click", createRoom);
joinBtn.addEventListener("click", joinRoom);

function switchToClashMode() {
  mode = "clash";
  drawPoints = [];
  clashBtn.classList.add("active");
  localBtn.classList.remove("active");
  collabBtn.classList.remove("active");
  createRoomBtn.style.display = "block";
  clearCanvas();
  joinContainer.style.display = "block";
}
function switchToLocalMode() {
  mode = "local";
  drawPoints = JSON.parse(localStorage.getItem("drawPoints")) || [];
  drawPoints.forEach((point) => drawOnCanvas(point));
  localBtn.classList.add("active");
  clashBtn.classList.remove("active");
  collabBtn.classList.remove("active");

  createRoomBtn.style.display = "none";
  loadLocalDrawings();
  joinContainer.style.display = "none";
}
function switchToCollabMode() {
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
}

function createRoom() {
  joinCode.style.display = "none";
  shareCode.style.display = "block";
  const roomCode = Math.random().toString(36).substring(2, 15);
  socket.emit("create-room", roomCode);
}
function joinRoom() {
  shareCode.style.display = "none";
  joinCode.style.display = "block";
  const roomCode = joinCode.value;
  socket.emit("join-room", roomCode);
}

function saveLocalDrawings() {
  localStorage.setItem("drawPoints", JSON.stringify(drawPoints));
}
function loadLocalDrawings() {
  const savedDrawPoints = JSON.parse(localStorage.getItem("drawPoints"));
  if (savedDrawPoints) {
    drawPoints = savedDrawPoints;
    drawPoints.forEach((point) => draw(point));
  }
  const savedDrawPoints1 = JSON.parse(
    localStorage.getItem("drawPoints-" + room),
  );
  if (savedDrawPoints1) {
    drawPoints = savedDrawPoints1;
    drawPoints.forEach((point) => drawOnCanvas(point));
    localStorage.setItem("drawPoints-" + room, JSON.stringify(drawPoints));
  }
  if (drawPoints.length > 0) {
    ctx.strokeStyle = drawPoints[drawPoints.length - 1].color;
  }
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

socket.on("draw", (data) => {
  ctx.beginPath();
  ctx.moveTo(data.x1, data.y1);
  ctx.lineTo(data.x2, data.y2);
  ctx.stroke();
  ctx.closePath();
});

socket.on("clear", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

window.onload = switchToLocalMode;
