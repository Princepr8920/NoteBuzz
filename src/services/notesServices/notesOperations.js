const { Service_Error } = require("../errorHandler"),
  { database } = require("../../loaders/mongodb"),
  notesDb = database("notesCollection"),
  { v4: uuidv4 } = require("uuid"),
  {
    isOldNote,
    deleteSavedIds,
    getNotesBatch,
    deleteUserBatch,
    deleteNoteFromBatch,
  } = require("./notesBatch");

async function saveNotesToDb(userID) {
  let notes = getNotesBatch(userID);
  let notesToSave = [];

  for (let note in notes) {
    if (isOldNote(userID, notes[note].noteID)) {
      notesToSave.push({
        updateOne: {
          filter: {
            userID, // Filter the document by userID
            "notes.noteID": notes[note].noteID, // Match the note within the notes array by noteID
          },
          update: {
            $set: {
              "notes.$.noteContent": notes[note].noteContent,
              "notes.$.noteTitle": notes[note].noteTitle.trim(),
              "notes.$.colorCode": notes[note].colorCode,
              "notes.$.timestamp": notes[note].timestamp,
            },
          },
        },
      });
    } else {
      let newNoteData = {
        ...notes[note],
        noteTitle: notes[note].noteTitle.trim(),
        noteID: uuidv4(),
      };
      notesToSave.push({
        updateOne: {
          filter: { userID },
          update: { $push: { notes: newNoteData } },
          upsert: true,
        },
      });
    }
  }

  try {
    if (notesToSave.length) {
      const saveNotes = await notesDb.bulkWrite(notesToSave);

      if (saveNotes?.result?.nModified) {
        deleteUserBatch(userID);
        deleteSavedIds(userID);
        notesToSave = [];
      } else {
        throw new Service_Error("Notes Couldn't be saved!", 500, false);
      }
    }

    return { success: true, message: "Notes saved!" };
  } catch (error) {
    console.error(error);
    return error;
  }
}

async function deleteNoteFromDb(userID, noteID) {
  try {
    const deleteFromBatch = deleteNoteFromBatch(userID, noteID); // delete note from batch also
    const deleteFromDb = await notesDb.updateOne(
      { userID }, // Filter the document by userID
      { $pull: { notes: { noteID } } } // Remove the note with the specified noteID
    );
    if (deleteFromDb.modifiedCount || deleteFromBatch) {
      return { noteID, success: true, message: "Note Deleted!" };
    } else {
      throw new Service_Error("Note Couldn't be deleted!", 500, false);
    }
  } catch (error) {
    return error;
  }
}

module.exports = { saveNotesToDb, deleteNoteFromDb };
