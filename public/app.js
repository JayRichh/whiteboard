const canvas = document.getElementById("my-canvas");
const socket = io.connect(window.location.origin);

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

const ctx = canvas.getContext("2d");

const clearBtn = document.getElementById("clear-btn");
const redBtn = document.getElementById("red-btn");
const blueBtn = document.getElementById("blue-btn");
const greenBtn = document.getElementById("green-btn");
const blackBtn = document.getElementById("black-btn");
const colorPicker = document.getElementById("color-picker");

let drawing = false;
let x1, y1; 
let room = null;

function draw(e) {
  if (drawing && room) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    ctx.closePath();

    socket.emit('draw', { x1, y1, x2: e.offsetX, y2: e.offsetY, room });

    x1 = e.offsetX;
    y1 = e.offsetY;
  }
}

document.getElementById('join-btn').addEventListener('click', () => {
  room = document.getElementById('share-code').value;
  socket.emit('join-room', room);
});
colorPicker.addEventListener("blur", (e) => {
  ctx.strokeStyle= e.target.value;
})
clearBtn.addEventListener("click", () => {
  if (room) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit('clear', room);
  }
});
redBtn.addEventListener("click", () => {
  ctx.strokeStyle="#FF0000";
  colorPicker.value = "#FF0000"
})
blueBtn.addEventListener("click", () => {
  ctx.strokeStyle="#0000FF";
  colorPicker.value = "#0000FF"
})
greenBtn.addEventListener("click", () => {
  ctx.strokeStyle="#00FF00";
  colorPicker.value = "#00FF00"
})
blackBtn.addEventListener("click", () => {
  ctx.strokeStyle="black";
  colorPicker.value = "#000000"
})

canvas.addEventListener("mousedown", (e) => {
  init(e);
})
canvas.addEventListener("mousemove", (e) => {
  draw(e);
})

canvas.addEventListener("mouseup", (e) => {
  drawing = false;
})

function init(e) {
  x1 = e.offsetX; 
  y1 = e.offsetY;
  drawing = true;
}

socket.on('draw', (data) => {
  ctx.beginPath();
  ctx.moveTo(data.x1, data.y1);
  ctx.lineTo(data.x2, data.y2);
  ctx.stroke();
  ctx.closePath();
});

socket.on('clear', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});


