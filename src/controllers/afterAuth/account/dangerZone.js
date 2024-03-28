const { Verificaiton_Error } = require("../../../services/errorHandler"),
  passwordService = require("../../../services/passwordService"),
  SECURE_PASSWORD = new passwordService(),
  createToken = require("../../../services/createToken"),
  { database } = require("../../../loaders/mongodb"),
  userDb = database("userCollection"),
  notesDb = database("notesCollection");

const deleteAccount = async (req, res, next) => {
  const token = req.cookies.mng_mode;

  try {
    let deleteUserAccount = await userDb.deleteOne({
      "tokens.securityToken": token,
    });

    if (deleteUserAccount.deletedCount) {
      await notesDb.deleteOne({ userID: req.user.userID });
      res.clearCookie("app_connect", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });
      res.clearCookie("mng_mode", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });
      return res
        .status(200)
        .json({ message: "Account deleted successfully", success: true });
    } else {
      throw new Error("Something went wrong", 500);
    }
  } catch (error) {
    return next(error);
  }
};

// When user want to delete their account. He/she have to confirm their access with the security lock

const securityLock = async (req, res, next) => {
  const { securityCode } = req.body;
  const token = req.cookies.app_connect;

  try {
    const isPasswordOK = await SECURE_PASSWORD.checkPassword(
      securityCode,
      token
    );

    if (isPasswordOK) {
      const tokens = await createToken({
        user: req.user,
        saveToken: ["securityToken"],
        tokensToCreate: ["securityToken"],
        deleteToken: null,
      }); 

      if (tokens.success) {
        const { securityToken } = tokens.createdTokens;

        res.cookie("mng_mode", securityToken, {
          httpOnly: true,
          sameSite: "strict",
          secure: true,
          maxAge: 3 * 60 * 60 * 1000,
        });
        return res.sendStatus(200);
      } else {
        return next(tokens);
      }
    } else {
      throw new Verificaiton_Error("Wrong Password", 401);
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = { deleteAccount, securityLock };
