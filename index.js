const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const cors = require("cors");
var wordGenerator = require("word-pictionary-list");

const { addUser, removeUser, getUser, getUsersInRoom } = require("./users");

const {
  addPlayer,
  removePlayer,
  isPlayer,
  numOfPlayers,
  getCurPlayer,
  setNextPlayer,
} = require("./players");

const PORT = process.env.PORT || 5000;

const router = require("./router");

var noun;

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "*",
  },
});
app.use(router);
app.use(cors());

io.on("connection", (socket) => {
  socket.on("join", ({ name, room, color }, callback) => {
    const user = addUser(socket.id, name, room, color);
    const admin = { id: "-1", name: "admin", color: "black" };
    socket.emit("message", {
      user: admin,
      text: `${user.name}, welcome to room ${user.room}`,
    });
    socket.broadcast
      .to(user.room)
      .emit("message", { user: admin, text: `${user.name} has joined!` });

    socket.join(user.room);

    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    if (
      isPlayer(user.id, user.room) &&
      user.id !== getCurPlayer(user.room).id &&
      noun &&
      message.toLowerCase() === noun.toLowerCase()
    ) {
      const admin = { id: "-1", name: "admin", color: "black" };
      io.to(user.room).emit("message", {
        user: admin,
        text: `${user.name} guessed it right`,
      });
    } else {
      io.to(user.room).emit("message", { user: user, text: message });
    }
    callback();
  });

  socket.on("getOnlineUsers", (room, callback) => {
    const users = getUsersInRoom(room);
    callback(users);
  });

  socket.on("addPlayer", (id, name, room) => {
    addPlayer(id, name, room);
    socket.emit("defaultDrawer", id, getCurPlayer(room));
  });

  socket.on("drawing", (data) => {
    socket.broadcast.to(data.room).emit("drawing", data);
  });

  socket.on("removePlayer", (id, room) => {
    removePlayer(id, room);
  });

  socket.on("retrieveWord", (callback) => {
    noun = wordGenerator();
    callback(noun);
  });

  socket.on("updatePlayer", (room) => {
    setNextPlayer(room);
    io.to(room).emit("playerChanged", getCurPlayer(room));
  });

  socket.on("checkExitable", (room, callback) => {
    var onlyOne = numOfPlayers(room) === 1;
    callback(onlyOne);
  });

  socket.on("clearAllBoard", (room) => {
    io.to(room).emit("clearBoard");
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
  });
});

server.listen(PORT, () => console.log(`Server has started on port ${PORT}.`));
