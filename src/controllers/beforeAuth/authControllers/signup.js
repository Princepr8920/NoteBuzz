const createToken = require("../../../services/createToken");

const signup = async (req, res, next) => {
  let newUser = req.user;
  let tokens = await createToken({
    user: newUser,
    saveToken: ["signupToken"],
    tokensToCreate: ["signupToken"],
    deleteToken: null,
  });

  if (tokens.success) {
    const { signupToken } = tokens.createdTokens;

    res.cookie("welcome_cookies", signupToken, {
      maxAge: 30 * 60 * 1000,
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res.status(202).json({
      message: "Account verification pending.",
      email: newUser.email,
      success: true,
    });
  } else {
    return next(tokens); // It is an error
  }
};

module.exports = signup;
