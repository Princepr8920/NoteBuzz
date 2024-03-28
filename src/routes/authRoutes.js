const express = require("express"),
  router = express.Router(),
  mustVerifiedAccount = require("../middlewares/ensureVerified"),
  signin = require("../controllers/beforeAuth/authControllers/signin"),
  signup = require("../controllers/beforeAuth/authControllers/signup"),
  VerifyUser = require("../controllers/beforeAuth/verificationControllers/verifyUser"),
  cancelVerification = require("../controllers/beforeAuth/verificationControllers/cancelVerification"),
  resendOtp = require("../controllers/beforeAuth/verificationControllers/resendVerification"),
  refresh = require("../controllers/beforeAuth/persistantControllers/refresh"),
  {
    signinValidation,
    signupValidation,
    validator,
    codeValidation,
    recoverPasswordValidation,
  } = require("../middlewares/validator"),
  local_signup = require("../middlewares/local_signup"),
  local_signin = require("../middlewares/local_signin"),
  twoStepVerification = require("../middlewares/twoStepVerification"),
  recoverPassword = require("../controllers/beforeAuth/recoveryControllers/recover"),
  resetPasswordLink = require("../controllers/beforeAuth/recoveryControllers/resetLink"),
  setNewPassword = require("../controllers/beforeAuth/recoveryControllers/newPassword"),
  verifyTaskToken = require("../middlewares/verifyTaskToken");
  logout = require("../controllers/afterAuth/logout")
// signup routes ✔✔✔✔✔✔✔✔

router.post(
  "/signup",
  mustVerifiedAccount,
  signupValidation,
  validator,
  local_signup,
  signup
);

router.post(
  "/verify-user-account",
  codeValidation,
  validator,
  verifyTaskToken,
  VerifyUser
);

router.get("/resend-account-verification-code", verifyTaskToken, resendOtp);

router.delete("/cancel-verification", cancelVerification);

///// signin routes  ✌✌✌✌✌✌

router.post(
  "/signin",
  mustVerifiedAccount,
  signinValidation,
  validator,
  local_signin,
  signin
);

router.get("/resend-2-step-verification-code", verifyTaskToken, resendOtp);

router.post(
  // if two-step-verification enabled
  "/two-step-verification",
  verifyTaskToken,
  twoStepVerification,
  signin
);

// account recovery

router.post("/user/password/recovery", recoverPassword);

router.get("/account/verify/:token", resetPasswordLink);

router.post(
  "/user/password/setnewpassword/:token",
  verifyTaskToken,
  recoverPasswordValidation,
  validator,
  setNewPassword
);

// persistant signin

router.get("/api/refresh", refresh);

// logout route

router.get("/api/logout", logout);

module.exports = router;
