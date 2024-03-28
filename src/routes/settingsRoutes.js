const express = require("express"),
  router = express.Router(),
  {
    darkMode,
    viewMode,
  } = require("../controllers/afterAuth/settings/appearance"),
  feedback = require("../controllers/afterAuth/settings/feedback"),
  {
    validator,
    securityValidation,
    passwordValidation,
    appearanceValidation,
  } = require("../middlewares/validator"),
  {
    updatePassword,
    twoStepVerification,
    loginNotification,
  } = require("../controllers/afterAuth/settings/security");

// appearance routes
router.patch(
  "/api/user/account/setting/appearance/dark-mode",
  appearanceValidation,
  validator,
  darkMode
);

router.patch(
  "/api/user/account/setting/appearance/grid-view",
  appearanceValidation,
  validator,
  viewMode
);

// security routes
router.patch(
  "/api/user/account/setting/security/two-step-verification",
  securityValidation,
  validator,
  twoStepVerification
);

router.patch(
  "/api/user/account/setting/security/login-notification",
  securityValidation,
  validator,
  loginNotification
);

router.patch(
  "/api/user/account/setting/security/password",
  passwordValidation,
  validator,
  updatePassword
);

// feedback route

router.post("/api/user/feedback", feedback);

module.exports = router;
