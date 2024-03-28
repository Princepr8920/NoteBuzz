const { Server } = require("socket.io"),
  connectToSocket = require("./connectToSocket"),
  disconnectSocket = require("./disconnectSocket"),
  { makeNote, deleteNote } = require("./noteEvents"),
  { createUserNotesBatch } = require("../notesServices/notesBatch"),
  SocketMiddleware = require("./socketMiddleware"),
  { getUserID, getUserInfo } = require("./socketOperations");

function mySocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  console.log("Web Sockets Activated ⚡");

  io.use(SocketMiddleware);
  io.on("connection", async (socket) => {
    let userID = getUserID(socket.id);
    let user = getUserInfo(userID);
    connectToSocket(socket, userID, user.username);
    createUserNotesBatch(userID);
    makeNote(userID, socket);
    deleteNote(userID, socket);
    disconnectSocket(socket, user);
  });
}

module.exports = mySocket;
