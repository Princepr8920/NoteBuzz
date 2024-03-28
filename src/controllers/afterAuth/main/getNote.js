const {
  saveNoteIdAsTemp,
  getNotesBatch,
} = require("../../../services/notesServices/notesBatch");
const { database } = require("../../../loaders/mongodb"),
  notesDb = database("notesCollection");

const getNote = async (req, res, next) => {
  try {
    /*First it will check if the opened note exist 
    in unsaved notes batch If it is so return it else check in DB  */

    let [userID, noteID] = [req.user.userID, req.params.noteid];

    if (getNotesBatch(userID)[noteID]) {
      return res
        .status(200)
        .json({ note: getNotesBatch(userID)[noteID], success: true });
    } else {
      const aggregationPipeline = [
        {
          $match: { userID }, // Match the specific user by userID
        },
        {
          $unwind: "$notes", // Unwind the notes array
        },
        {
          $match: { "notes.noteID": noteID }, // Match the specific note by noteID
        },
        {
          $project: {
            _id: 0,
            noteTitle: "$notes.noteTitle",
            noteContent: "$notes.noteContent",
            colorCode: "$notes.colorCode",
            timestamp: "$notes.timestamp",
            noteID: "$notes.noteID",
          },
        },
      ];
      const note = await notesDb.aggregate(aggregationPipeline).toArray();

      if (note[0]) {
        saveNoteIdAsTemp(userID, noteID); //  To remember noteID to update specific saved note
        return res.status(200).json({ note: note[0], success: true });
      } else {
        return res.status(404).json({ note: null, success: false });
      }
    }
  } catch (error) {
    next(error);
  }
};

module.exports = getNote;
