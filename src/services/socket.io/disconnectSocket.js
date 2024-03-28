const updateUserSession = require("./userSession"),
  { saveNotesToDb } = require("../notesServices/notesOperations"),
  { removeUser } = require("./socketOperations");

function disconnectSocket(socket, user) {
  socket.on("disconnect", async () => {
    let userID = user.userID;
    await updateUserSession(user);
    await saveNotesToDb(userID);
    removeUser(userID);
    console.log(`${user.username} is Offline 🔴`);
  });
}

module.exports = disconnectSocket;
