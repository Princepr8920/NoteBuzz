const { Verificaiton_Error } = require("../services/errorHandler"),
  { database } = require("../loaders/mongodb"),
  userDb = database("userCollection"),
  emailSender = require("../services/emailGenerator"),
  sendNewEmail = new emailSender();

async function twoStepVerifiation(req, res, next) {
  const { code } = req.body;
  const secureLogin = req.cookies.secure_login;

  try {
    if (secureLogin && code) {
      const user = await userDb.findOne({ "tokens.loginToken": secureLogin });
      const verifiedUser = await sendNewEmail.VerifyConfirmationCode(
        code,
        30 * 60 * 1000,
        user
      );
      if (user) {
        if (verifiedUser?.success) {
          res.clearCookie("secure_login", {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
          });
          //req.user = user // we have set the req.user = user; only for testing
          return next();
        } else {
          return next(verifiedUser);
        }
      }
    } else {
      throw new Verificaiton_Error("Bad request", 400);
    }
  } catch (error) {
    return next(error);
  }
}

module.exports = twoStepVerifiation;
