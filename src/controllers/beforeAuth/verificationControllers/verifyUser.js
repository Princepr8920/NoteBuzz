const createToken = require("../../../services/createToken"),
  filterInfo = require("../../../utils/filterInfo"),
  emailSender = require("../../../services/emailGenerator"),
  sendNewEmail = new emailSender(),
  { database } = require("../../../loaders/mongodb"),
  userDb = database("userCollection"),
  activateAccount = require("../../../services/activateAccount"),
  firstLetterUpperCase = require("../../../utils/caseSense");

const verifyNewUser = async (req, res, next) => {
  const confirmationCode = req.body.code;
  let user = null;

  try {
    user = await userDb.findOne({
      "tokens.signupToken": req.cookies.welcome_cookies,
    });
  } catch (error) {
    return next(error);
  }

  const VerifiedUser = await sendNewEmail.VerifyConfirmationCode(
    // To verify confirmation Code
    confirmationCode,
    20 * 60 * 1000,
    user
  );

  if (VerifiedUser.success) {
    const getAccount = await activateAccount(VerifiedUser.userProfile.email);
    /* To activate new user account and assign a unique userID.
      Remember that the userID only assign to user if it successfully verified */

    if (!getAccount.success) {
      return next(getAccount); // if any error account creation process will terminate
    }

    const tokens = await createToken({
      user: getAccount.activatedAccount,
      saveToken: ["refreshToken", "socketToken"],
      tokensToCreate: ["refreshToken", "accessToken", "socketToken"],
      deleteToken: null,
    });

    if (tokens.success) {
      const { refreshToken, accessToken, socketToken } = tokens.createdTokens;
      let excludeInfo = [
        "password",
        "_id",
        "confirmationCode",
        "userRequests",
        "verification",
        "tokens",
        "user_logs",
        "feedback",
        "provider",
        "__v",
        "userID",
      ];

      const filteredUserInfo = filterInfo(
        VerifiedUser.userProfile,
        excludeInfo
      );

      firstLetterUpperCase(filteredUserInfo, ["username", "email"]); // To do first letter upper case

      res.cookie("app_connect", refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        secure: true,
        sameSite: "none",
      });

      res.clearCookie("welcome_cookies", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });

      return res.status(200).json({
        user: filteredUserInfo,
        accessToken,
        socketToken,
        message: "Signup successfully.",
      });
    } else {
      return next(tokens);
    }
  } else {
    return next(VerifiedUser);
  }
};

module.exports = verifyNewUser;
