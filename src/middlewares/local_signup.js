const saveAndVerifyUser = require("../services/userService"),
  passport = require("passport"),
  filterInfo = require("../utils/filterInfo"),
  smallLetters = require("../utils/caseSense");

const local_signup = async (req, res, next) => {
  const userDTO = filterInfo(req.body, ["confirm_password"]); // remove confirm password field because it will not save in DB
  const userObject = smallLetters(userDTO, ["email"]);
  const isSaved = await saveAndVerifyUser(userObject);  // Save user info to db and send a verificaiton email
  if (isSaved.success) {
    passport.authenticate("local")(req, res, () => {
      next();
    });
  } else {
    return next(isSaved);/// if not success this will be become error
  }
};

module.exports = local_signup;
