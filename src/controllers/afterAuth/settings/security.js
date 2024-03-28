const { Update_Error } = require("../../../services/errorHandler"),
  passwordService = require("../../../services/passwordService"),
  SECURE_PASSWORD = new passwordService(),
  { database } = require("../../../loaders/mongodb"),
  userDb = database("userCollection");

const twoStepVerification = async (req, res, next) => {
  try {
    let updatedInfo = await userDb.findOneAndUpdate(
      { "tokens.refreshToken": req?.cookies?.app_connect },
      {
        $set: {
          "security.two_step_verification": req.body.two_step_verification,
        },
      },
      {
        returnDocument: "after",
      }
    );

    if (updatedInfo.value) {
      let isEnabled = req.body.two_step_verification ? "enabled" : "disabled";
      res.status(200).json({
        success: true,
        message: `Two-step verification has been ${isEnabled}`,
      });
    } else {
      throw new Update_Error(
        "Two-step-verification couldn't be enabled !",
        500
      );
    }
  } catch (err) {
    return next(err);
  }
};

const loginNotification = async (req, res, next) => {
  try {
    let updatedInfo = await userDb.findOneAndUpdate(
      { "tokens.refreshToken": req?.cookies?.app_connect },
      {
        $set: { "security.login_notification": req.body.login_notification },
      },
      {
        returnDocument: "after",
      }
    );

    if (updatedInfo.value) {
      let isEnabled = req.body.login_notification ? "enabled" : "disabled";
      res.status(200).json({
        success: true,
        message: `Login notification has been ${isEnabled}`,
      });
    } else {
      throw new Update_Error("Login notification couldn't be enabled !", 500);
    }
  } catch (err) {
    return next(err);
  }
};

const updatePassword = async (req, res, next) => {
  console.log(req.body);
  try {
    let newPasswordSuccess = await SECURE_PASSWORD.setNewPassword(
      req.body.new_password,
      req?.cookies?.app_connect
    );
    if (newPasswordSuccess.success) {
      res
        .status(200)
        .json({ success: true, message: newPasswordSuccess.message });
    } else {
      return next(newPasswordSuccess);
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = { updatePassword, twoStepVerification, loginNotification };
