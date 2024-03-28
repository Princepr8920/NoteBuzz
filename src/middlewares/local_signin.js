const passport = require("passport"),
  emailSender = require("../services/emailGenerator"),
  sendNewEmail = new emailSender(),
  createToken = require("../services/createToken");

const local_signin = async (req, res, next) => {
  passport.authenticate("local", async function (err, user, info) {
    if (err) {
      return next(info);
    } else if (!user) {
      return next(info);
    } else {
      req.login(user, async function (error) {
        if (error) return next(error);
        // This setup is for two-step-verifiction if it has enbled
        // req.user = user; // uncomment for testing purpose only

        if (user.security.two_step_verification) {
          try {
            const isEmailSent = await sendNewEmail.twoStepVerification(user);
            if (isEmailSent.success) {
              const tokens = await createToken({
                user,
                saveToken: ["loginToken"],
                tokensToCreate: ["loginToken"],
                deleteToken: null,
              });
              if (tokens.success) {
                res.cookie("secure_login", tokens.createdTokens.loginToken, {
                  httpOnly: true,
                  secure: true,
                  sameSite: "strict",
                  maxAge: 30 * 60 * 10000,
                });
                return res.status(202).json(isEmailSent);
              } else {
                next(tokens);
              }
            } else {
              return next(isEmailSent);
            }
          } catch (error) {
            next(error);
          }
        }
        return next();
      });
    }
  })(req, res, next);
};

module.exports = local_signin;
