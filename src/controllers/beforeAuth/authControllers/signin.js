const { database } = require("../../../loaders/mongodb"),
  notesDb = database("notesCollection"),
  { formatDate } = require("../../../utils/userAge"),
  createToken = require("../../../services/createToken"),
  filterInfo = require("../../../utils/filterInfo"),
  loginNotification = require("../../../services/userAgent");

const signin = async (req, res, next) => {
  let userInfo = req.user;

  let tokens = await createToken({
    user: userInfo,
    saveToken: ["refreshToken", "socketToken"],
    tokensToCreate: ["refreshToken", "accessToken", "socketToken"],
    deleteToken: { requestsToken: "", loginToken: "" },
  });

  if (tokens.success) {
    const { refreshToken, accessToken, socketToken } = tokens.createdTokens;
    try {
      const findNotes = await notesDb.findOne({ userID: userInfo.userID });
      if (findNotes) {
        userInfo.notes = findNotes.notes;
      } else {
        throw new Error("Something went wrong", 500);
      }

      if (userInfo.security.login_notification) {
        await loginNotification({
          agentInfo: req.headers["user-agent"],
          username: userInfo.username,
          email: userInfo.email,
        });
      }
    } catch (error) {
      return next(error);
    }

    res.cookie("app_connect", refreshToken, {
      httpOnly: true,
      // sameSite: "strict",
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

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
    ];

    let filteredUserInfo = filterInfo(userInfo, excludeInfo);

    return res.status(200).json({
      user: filteredUserInfo,
      accessToken,
      socketToken,
      success: true,
      message: "Login successful",
    });
  } else {
    return next(tokens);
  }
};

module.exports = signin;
