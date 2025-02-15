const notesBatch = {};
const savedNoteIds = {};

function createUserNotesBatch(userID) {
  notesBatch[userID] = {};
  return;
}

function insertToNotesBatch(userID, newNote) {
  const batch = notesBatch[userID];

  if (batch[newNote.noteID]) { 
    notesBatch[userID][newNote.noteID] = {
      ...batch[newNote.noteID],
      ...newNote,
    };
  } else {
    notesBatch[userID][newNote.noteID] = newNote;
  }
  return;
}

function saveNoteIdAsTemp(userID, noteID) {
  /* This function will temporary save the noteIDs of
   savedNotes to differentiate between newNote and oldNote (savedNote) */
  if (savedNoteIds[userID] && !savedNoteIds[userID].includes(noteID)) {
    savedNoteIds[userID].push(noteID);
  } else {
    savedNoteIds[userID] = [noteID];
  }
  return noteID;
}

const isOldNote = (userID, noteID) =>
  savedNoteIds[userID] && savedNoteIds[userID].includes(noteID);
const deleteSavedIds = (userID) => delete savedNoteIds[userID];
const getNotesBatch = (userID) => notesBatch[userID];
const deleteUserBatch = (userID) => delete notesBatch[userID];
const deleteNoteFromBatch = (userID, noteID) => {
  if (notesBatch[userID][noteID]) {
    delete notesBatch[userID][noteID];
    return true;
  } else {
    return false;
  }
};

module.exports = {
  saveNoteIdAsTemp,
  isOldNote,
  deleteSavedIds,
  createUserNotesBatch,
  getNotesBatch,
  insertToNotesBatch,
  deleteUserBatch,
  deleteNoteFromBatch,
};