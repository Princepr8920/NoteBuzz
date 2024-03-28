const router = require("express").Router(),
  accountInfo = require("../controllers/afterAuth/account/AccountInfo"),
  userAvatar = require("../controllers/afterAuth/account/userAvatar"),
  {
    verifyUserEmail,
    resendVerificaiton,
  } = require("../controllers/afterAuth/account/verifyNewEmail"),
  verifyTaskToken = require("../middlewares/verifyTaskToken"),
  {
    deleteAccount,
    securityLock,
  } = require("../controllers/afterAuth/account/dangerZone"),
  { codeValidation, validator } = require("../middlewares/validator");

router.patch("/api/user/account/avatar", userAvatar);

router.patch("/api/user/account-information", accountInfo);

router.post(
  "/api/user/email/verification/done",
  codeValidation,
  validator,
  verifyTaskToken,
  verifyUserEmail
);

router.get(
  "/api/user/email/verificaiton/resend",
  verifyTaskToken,
  resendVerificaiton
);

router.post("/api/user/account/security", securityLock);

router.delete("/api/delete/user-account", verifyTaskToken, deleteAccount);

module.exports = router;
