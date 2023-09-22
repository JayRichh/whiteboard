const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
  socket.on('join-room', (room) => {
    socket.join(room);
  });

  socket.on('draw', (data) => {
    socket.to(data.room).emit('draw', data);
  });

  socket.on('clear', (room) => {
    socket.to(room).emit('clear');
  });
});

server.listen(3000, () => {
  console.log('http://localhost:3000');
});
