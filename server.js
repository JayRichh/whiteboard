const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { join } = require("path");

const app = express();
const server = createServer(app);
const io = new Server(server);
let activeRooms = [];

app.use(express.static(join(__dirname, "public")));

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("join-room", (room) => {
    socket.join(room);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
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
  });

  socket.on("clear", (room) => {
    socket.to(room).emit("clear");
  });
});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});
