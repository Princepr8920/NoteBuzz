function connectToSocket(socket, user, username) {
  socket.on("user-online", async () => {
    socket.userID = user;
    socket.join(user);
    console.log(`${username} is Online 🟢`);
  });
}

module.exports = connectToSocket;
