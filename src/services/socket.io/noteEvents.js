const { insertToNotesBatch } = require("../notesServices/notesBatch");
const { deleteNoteFromDb } = require("../notesServices/notesOperations");

function makeNote(userID, socket) {
  socket.on("make-a-note", async (data) => {
    insertToNotesBatch(userID, data);
  });
}

function deleteNote(userID, socket) {
  socket.on("delete-a-note", async (noteID) => {
    let deletedNote = await deleteNoteFromDb(userID, noteID);
    socket.emit("note-deleted", deletedNote);
  });
}

module.exports = { makeNote, deleteNote };
