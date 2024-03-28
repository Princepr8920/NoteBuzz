const { database } = require("../../../loaders/mongodb"),
  notesDb = database("notesCollection");

const notes = async (req, res, next) => {
  try {
    const savedNotes = await notesDb.findOne({ userID: req.user.userID });

    if (savedNotes) {
      savedNotes.notes.sort((a, b) => new Date(b.timestamp).getTime()  - new Date(a.timestamp).getTime()  );
    } 
    return res.status(200).json({ notes: savedNotes.notes, success: true });
  } catch (error) {
    next(error);
  }
};

module.exports = notes;
