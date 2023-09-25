const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { join } = require("path");
const crypto = require("crypto");
const PORT = process.env.PORT || 3000;

const app = express();
const server = createServer(app);
const io = new Server(server);
let activeRooms = [];
let players = {};
let scores = {};

app.use(express.static(join(__dirname, "public")));
app.use("/icons", express.static(join(__dirname, "public/icons")));
app.use(express.json());

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("join-room", (room) => {
    socket.join(room);
    if (!players[room]) {
      players[room] = [];
    }
    players[room].push(socket.id);
    io.to(room).emit("updatePlayers", { players: players[room] });
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
    for (let room in players) {
      players[room] = players[room].filter((player) => player !== socket.id);
      io.to(room).emit("updatePlayers", { players: players[room] });
    }
  });

  socket.on("create-room", (room) => {
    if (activeRooms.includes(room)) {
      socket.emit("error", { message: "Room already exists" });
    } else {
      activeRooms.push(room);
      socket.join(room);
    }
  });

  socket.on("error", (error) => {
    console.log(error.message);
  });

  socket.on("draw", (data) => {
    console.log("draw event received", data);
    socket.to(data.room).emit("draw", data);
  });

  socket.on("clear", (room) => {
    socket.to(room).emit("clear");
  });

  socket.on("startGame", (data) => {
    socket.to(data.room).emit("startGame", data);
  });

  socket.on("endGame", (data) => {
    socket.to(data.room).emit("endGame", data);
  });

  socket.on("submitGuess", (data) => {
    socket.to(data.room).emit("submitGuess", data);
  });

  socket.on("updatePlayerName", (data) => {
    socket.to(data.room).emit("updatePlayerName", data);
  });

  app.get("/health", (req, res) => {
    res.sendStatus(200);
  });
});

server.listen(PORT, () => {
  console.log(`server running at http://localhost:${PORT}`);
});
