const { Verificaiton_Error } = require("../services/errorHandler");
const smallLetters = require("../utils/caseSense");
const { database } = require("../loaders/mongodb"),
  userDb = database("userCollection");

/* This middleware check if an unverified
 user account exist in db and if new user want to 
 create new account with same email and username
  this middleware delete unverified account first*/

async function mustVerifiedAccount(req, res, next) {
  let userInfo = smallLetters(req.body, ["email"]);
  let user = await userDb.findOne({
    $or: [{ email: userInfo.email }, { username: userInfo.username }],
  });

  try {
    if (user && user.userID === "" && !user.verification) {
      const isDeleted = await userDb.deleteOne({ email: user.email });
      if (isDeleted.deletedCount) {
        next();
      } else {
        throw new Verificaiton_Error("Something went wrong,", 500);
      }
    } else {
      next();
    }
  } catch (error) {
    return next(error);
  }
}

module.exports = mustVerifiedAccount;
