const emailSender = require("../services/emailGenerator"),
  sendNewEmail = new emailSender(),
  { Update_Error } = require("../services/errorHandler"),
  { database } = require("../loaders/mongodb"),
  userDb = database("userCollection");

async function requestManager(newdata, token) {
  try {
    let manageRequest = await userDb.findOneAndUpdate(
      /* Set user email request so we use this requested email to
       send email and later we will set user account email*/
      { "tokens.refreshToken": token },
      {
        $set: {
          "userRequests.emailRequest": {
            requestedEmail: newdata.email,
            issueAt: new Date(),
          },
        },
      },
      { returnDocument: "after" }
    );

    if (manageRequest.value) {
      const emailSuccess = await sendNewEmail.sendEmail({
        userID: manageRequest.value.userID,
        email: newdata.email,
        type: "verify_Email",
        resend: false,
      });
      return emailSuccess;
    } else {
      throw new Update_Error("Email update failed", 500);
    }
  } catch (error) {
    return error;
  }
}

module.exports = requestManager;
