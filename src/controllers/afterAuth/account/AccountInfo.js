const { Update_Error } = require("../../../services/errorHandler"),
  { database } = require("../../../loaders/mongodb"),
  createToken = require("../../../services/createToken"),
  userDb = database("userCollection"),
  notesDb = database("notesCollection"),
  requestManager = require("../../../services/requestManager");

const accountInfo = async (req, res, next) => {
  const update = req.body;
  const token = req.cookies.app_connect;
  const user = await userDb.findOne({ "tokens.refreshToken": token });

  try {
    if (user) {
      let isEmailRequest = null;
      if (update.hasOwnProperty("email")) {
        let isRequestManaged = await requestManager(update, token);
        if (!isRequestManaged?.success) {
          return next(isRequestManaged);
        }
        isEmailRequest = isRequestManaged;
        delete update.email; /// delete this property because email will be verify and update rest property

        if (!update.hasOwnProperty("username")) {
          let getToken = await createToken({
            user,
            saveToken: ["emailVerificationToken"],
            tokensToCreate: ["emailVerificationToken"],
            deleteToken: null,
          });

          if (getToken.success) {
            const { emailVerificationToken } = getToken.createdTokens;

            res.cookie("verify_email", emailVerificationToken, {
              maxAge: 30 * 60 * 1000,
              httpOnly: true,
              secure: true,
              sameSite: "strict",
            });
            return res.status(202).json(isEmailRequest);
          } else {
            throw new Update_Error("Couldn't update information", 500);
          }
        }
      }
      let counter = user.user_logs.username_logs.length;
      const updateSuccess = await userDb.findOneAndUpdate(
        { userID: user.userID },
        {
          $set: update,
          $push: {
            // update username logs
            "user_logs.username_logs": {
              username: update.username,
              updated_on: new Date(),
              update_count: counter++,
            },
          },
        },
        {
          returnDocument: "after",
        }
      );

      const updateNotesProfile = await notesDb.findOneAndUpdate(
        { userID: user.userID },
        { $set: { username: update.username } },
        { returnDocument: "after" }
      );

      if (updateSuccess.value && updateNotesProfile.value) {
        if (isEmailRequest) {
          let token = await createToken({
            user,
            saveToken: ["emailVerificationToken"],
            tokensToCreate: ["emailVerificationToken"],
            deleteToken: null,
          });

          if (token.success) {
            const { emailVerificationToken } = token.createdTokens;

            res.cookie("verify_email", emailVerificationToken, {
              maxAge: 30 * 60 * 1000,
              httpOnly: true,
              secure: true,
              sameSite: "strict",
            });
            return res.status(202).json(isEmailRequest);
          } else {
            throw new Update_Error("Couldn't update information", 500);
          }
        } else {
          return res.status(200).json({
            success: true,
            message: "Information updated successfully",
          });
        }
      } else {
        throw new Update_Error("Couldn't update information", 500);
      }
    } else {
      throw new Update_Error("Couldn't update information", 500);
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = accountInfo;
