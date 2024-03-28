const createUniqueIndex = require("./createUniqueIndex");
const { Verificaiton_Error } = require("./errorHandler");
const { database, client } = require("../loaders/mongodb"),
  userDb = database("userCollection"),
  notesDb = database("notesCollection"),
  { v4: uuidv4 } = require("uuid");

module.exports = async function activateAccount(email) {
  try {
    const userID = uuidv4(); // create a new unique userID for new user
    const activate = await userDb.findOneAndUpdate(
      { email },
      {
        $set: { verification: true, userID: userID, "tokens.signupToken": "" },
      },
      {
        returnDocument: "after",
      }
    );

    if (activate.value) {
      await createUniqueIndex(client, {
        selectedDb: "ShortLine",
        selectedCollection: "notesCollection",
        uniqueness: { userID: 1 },
      });
      await notesDb.insertOne({
        // To create notes realted fields
        userID: userID,
        username: activate.value.username,
        notes: [],
      });

      activate.value.notes = []; // initilize notes object to display saved notes

      return { activatedAccount: activate.value, success: true };
    } else {
      throw new Verificaiton_Error("Something went wrong.", 500, false);
    }
  } catch (error) {
    return error;
  }
};
