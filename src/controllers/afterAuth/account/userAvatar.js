const { database } = require("../../../loaders/mongodb"),
  userDb = database("userCollection");

const userAvatar = async (req, res, next) => {
  try {
    const updateUserAvatar = await userDb.findOneAndUpdate(
      { "tokens.refreshToken": req.cookies.app_connect },
      {
        $set: {
          avatar: req.body.avatar,
        },
      },
      { returnDocument: "after" }
    );

    if (updateUserAvatar.value) {
      return res.status(200).json({
        success: true,
        message: `Avatar has been changed successfully.`,
      });
    } else {
      throw new Update_Error("Avatar couldn't be chnaged", 500);
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = userAvatar;
