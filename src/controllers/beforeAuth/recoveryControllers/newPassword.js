const { Update_Error } = require("../../../services/errorHandler"),
  passwordService = require("../../../services/passwordService"),
  SECURE_PASSWORD = new passwordService(),
  { database } = require("../../../loaders/mongodb"),
  userDb = database("userCollection");

const setNewPassword = async (req, res, next) => {
  let token = req.cookies?.change_once;
  let { new_password } = req.body;

  try {
    let { success, message } = await SECURE_PASSWORD.setNewPassword(
      new_password,
      token
    ); 
    if (success) {
      res.clearCookie("change_once", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });

      res.clearCookie("recovery_mode", {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });

      await userDb.updateOne(
        { "tokens.requestsToken": token },
        { $set: { "tokens.requestsToken": "" } }
      );

      return res.status(200).json({
        success: true,
        message: "Password reset successful",
      });
    } else {
      throw new Update_Error(message, 500);
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = setNewPassword;
