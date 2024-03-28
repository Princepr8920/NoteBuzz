const { Update_Error } = require("../../../services/errorHandler"),
  { database } = require("../../../loaders/mongodb"),
  userDb = database("userCollection");

const darkMode = async (req, res, next) => {
  const token = req.cookies.app_connect;

  try {
    let update = await userDb.findOneAndUpdate(
      { "tokens.refreshToken": token },
      { $set: { "appearance.dark_mode": req.body.dark_mode } },
      { returnDocument: "after" }
    );

    if (update.value) {
      let selectedValue = {
        auto: "Auto",
        system_default: "System default",
        on: "On",
        off: "Off",
      };

      return res.status(200).json({
        success: true,
        message: `Dark mode set to ${selectedValue[req.body.dark_mode]}`,
      });
    } else {
      throw new Update_Error("Settings couldn't be updated", 500);
    }
  } catch (error) {
    return next(error);
  }
};

const viewMode = async (req, res, next) => {
  const token = req.cookies.app_connect;

  try {
    let update = await userDb.findOneAndUpdate(
      { "tokens.refreshToken": token },
      { $set: { "appearance.grid_view": req.body.grid_view } },
      { returnDocument: "after" }
    );

    if (update.value) {
      let isEnabled = req.body.grid_view ? "enabled" : "disabled";
      return res.status(200).json({
        success: true,
        message: `Grid view has ${isEnabled}`,
      });
    } else {
      throw new Update_Error("Settings couldn't be updated", 500);
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = { darkMode, viewMode };
