const { Verificaiton_Error } = require("../../../services/errorHandler");
(emailSender = require("../../../services/emailGenerator")),
  (sendNewEmail = new emailSender()),
  (createToken = require("../../../services/createToken")),
  ({ database } = require("../../../loaders/mongodb")),
  (userDb = database("userCollection"));

const recoverPassword = async (req, res, next) => {
  try {
    let user = await userDb.findOne({ email: req.body.email });
    if (user && user.verification) {
      const { username, email } = user;

      const tokens = await createToken({
        user,
        saveToken: ["requestsToken"],
        tokensToCreate: ["requestsToken"],
        deleteToken:null
      });

      if (tokens.success) {
        const { requestsToken } = tokens.createdTokens;
        const link = `${process.env.BASE_URL}/account/verify/${requestsToken}`;
        const isLinkSend = await sendNewEmail.sendResetPasswordLink({
          username,
          email,
          link,
        });
        if (isLinkSend.success) {
          const { success, message } = isLinkSend;
          return res.status(200).json({
            success,
            message,
            email,
          });
        } else {
          return next(isLinkSend);
        }
      } else {
        return next(tokens);
      }
    } else {
      throw new Verificaiton_Error("No match found", 404);
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = recoverPassword;
