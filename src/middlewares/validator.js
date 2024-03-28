const { body, validationResult } = require("express-validator"),
  passwordService = require("../services/passwordService"),
  SECURE_PASSWORD = new passwordService(),
  { database } = require("../loaders/mongodb"),
  userDb = database("userCollection");


  /// preValidator for required fields

const preValidator = (req, res, next) => {
  const requiredFields = { 
    username: "Username",
    password: "Password",
    new_password: "New password",
    current_password: "Current password",
    confirm_password: "Confirm password",
    email: "Email", 
  };
  const fields = req.body;
  const names = Object.keys(requiredFields);
  const inputError = {};
  for (let key in fields) {
    if (names.includes(key) && fields[key] === "") {
      inputError[key] = [
        { message: `Enter a ${requiredFields[key]}`, name: key },
      ];
    }
  }

  return Object.keys(inputError).length
    ? res.status(400).json({ success: false, inputError })
    : next();
};


// validation of a new password to recoverPassword

const recoverPasswordValidation = [
  body("new_password")
    .custom(async (value, { req }) => {
      if (value) {
        const sameAsPrevious = await SECURE_PASSWORD.checkPassword(
          value,
          req.params.token
        );
        if (sameAsPrevious) {
          throw new Error("Previous passwords cannot be reused.");
        }
      } else {
        throw new Error("Please enter your new password.");
      }
      return true;
    })
    .bail()
    .isLength({ min: 8, max: 40 })
    .withMessage(
      "Use 8 or more characters with a mix of letters, numbers, and symbols."
    )
    .bail()
    .matches(/[!@#$\{%\}^;:\.\/'\["&\]*\(\)]+/g)
    .withMessage(
      "Your new password should have at least one special character."
    )
    .matches(/[A-Z]+/)
    .withMessage("Your password must have at least 1 uppercase letter.")
    .matches(/[a-z]+/)
    .withMessage("Your password must have at least 1 lowercase letter.")
    .matches(/\d+/)
    .withMessage("Your new password should have at least one number."),

  body("confirm_password").custom((value, { req }) => {
    if (value === undefined || value === "") {
      throw new Error("Please reconfirm your password.");
    } else if (value !== req.body.new_password) {
      throw new Error("Confirm password does not match");
    }
    return true;
  }),
];

const EmailOrUsernameValidation = [
  body("username")
    .if((value, { req }) => req.body.hasOwnProperty("username"))
    .trim()
    .notEmpty()
    .withMessage("Enter a username")
    .bail()
    .isLength({ min: 3, max: 20 })
    .withMessage("Username should be minimum 3 and maximum 30 characters")
    .matches(/^[\w\.]+$/)
    .withMessage(
      "Username can only use letters, numbers, underscores and periods."
    )
    .custom(async (value, { req }) => {
      const usernameNotAvailable = await userDb.findOne({ username: value });
      if (usernameNotAvailable) {
        throw new Error("That username is taken. Try another.");
      }
      return true;
    }),

  body("email")
    .if((value, { req }) => req.body.hasOwnProperty("email"))
    .trim()
    .notEmpty()
    .withMessage("Enter a email address")
    .bail()
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail()
    .custom(async (value, { req }) => {
      const emailNotAvilable = await userDb.findOne({ email: value });
      if (emailNotAvilable) {
        throw new Error(
          "This email address is not available. Choose a different address."
        );
      }
      return true;
    }),
];

const passwordValidation = [
  body("current_password")
    .notEmpty()
    .withMessage("Enter your current password")
    .bail()
    .custom(async (value, { req }) => {
      const isMatched = await SECURE_PASSWORD.checkPassword(
        value,
        req.cookies.app_connect
      );
      if (!isMatched) {
        throw new Error("Wrong password");
      } else {
        return true;
      }
    }),
  body("new_password")
    .custom(async (value, { req }) => {
      if (value) {
        const sameAsPrevious = await SECURE_PASSWORD.checkPassword(
          value,
          req.cookies.app_connect
        );
        if (sameAsPrevious) {
          throw new Error("Previous passwords cannot be reused.");
        }
      } else {
        throw new Error("Please enter your new password.");
      }
      return true;
    })
    .bail()
    .isLength({ min: 8, max: 40 })
    .withMessage(
      "Use 8 or more characters with a mix of letters, numbers, and symbols."
    )
    .bail()
    .matches(/[!@#$\{%\}^;:\.\/'\["&\]*\(\)]+/g)
    .withMessage(
      "Your new password should have at least one special character."
    )
    .matches(/[A-Z]+/)
    .withMessage("Your password must have at least 1 uppercase letter.")
    .matches(/[a-z]+/)
    .withMessage("Your password must have at least 1 lowercase letter.")
    .matches(/\d+/)
    .withMessage("Your new password should have at least one number."),

  body("confirm_password").custom((value, { req }) => {
    if (value === undefined || value === "") {
      throw new Error("Please reconfirm your password.");
    } else if (value !== req.body.new_password) {
      throw new Error("Confirm password does not match");
    }
    return true;
  }),
];

let securityValidation = [
  body("two_step_verification")
    .isBoolean()
    .withMessage("Must be a boolean true or false"),

  body("login_notification")
    .isBoolean()
    .withMessage("Must be a boolean true or false"),
];

let appearanceValidation = [
  body("dark_mode")
    .isIn(["on", "off", "auto", "system_default"])
    .withMessage("Invalid value"),

  body("grid_view").isBoolean().withMessage("Must be a boolean true or false"),
];

/// new user signup validation

const signupValidation = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Enter a username")
    .bail()
    .isLength({ min: 3, max: 20 })
    .withMessage("Username should be minimum 3 and maximum 30 characters.")
    .matches(/^[\w\.]+$/)
    .withMessage(
      "Username can only use letters, numbers, underscores and periods."
    )
    .custom(async (value, { req }) => {
      const usernameNotAvailable = await userDb.findOne({ username: value });
      if (usernameNotAvailable) {
        throw new Error("That username is taken. Try another.");
      }
      return true;
    }),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Enter a email address")
    .bail()
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail()
    .custom(async (value, { req }) => {
      const emailNotAvilable = await userDb.findOne({ email: value });
      if (emailNotAvilable) {
        throw new Error(
          "This email address is not available. Choose a different address."
        );
      }
      return true;
    }),

  body("password")
    .notEmpty()
    .withMessage("Enter a password")
    .isLength({ min: 8, max: 40 })
    .withMessage(
      "Use 8 or more characters with a mix of letters, numbers, and symbols."
    )
    .matches(/\d+/)
    .withMessage("Your password should have at least one number.")
    .matches(/[A-Z]+/)
    .withMessage("Your password must have at least 1 uppercase letter.")
    .matches(/[a-z]+/)
    .withMessage("Your password must have at least 1 lowercase letter.")
    .matches(/[!@#$\{%\}^;:\.\/'\["&\]*\(\)]+/g)
    .withMessage("Your password should have at least one special character."),

  body("confirm_password").custom((value, { req }) => {
    if (value === undefined || value === "") {
      throw new Error("Please reconfirm your password.");
    } else if (value !== req.body.password) {
      throw new Error("Confirm password does not match.");
    }
    return true;
  }),
];

// Signin validation

const signinValidation = [
  body("email")
    .if((value, { req }) => req.body.hasOwnProperty("email"))
    .trim()
    .notEmpty()
    .withMessage("Enter a email address")
    .bail()
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail(),
];

// for verification code valdiation
const codeValidation = [
  body("code")
    .isLength({ min: 6 })
    .withMessage("Invalid verification code")
    .bail()
    .matches(/(^[0-9]{6}$)/)
    .withMessage("Invalid verification code"),
];

const validator = async (req, res, next) => {
  const isError = validationResult(req);

  if (!isError.isEmpty()) {
    const inputError = {};
    const errorArr = isError.array();

    for (let i of errorArr) {
      if (!inputError.hasOwnProperty(i.param)) {
        inputError[i.param] = [];
      }
      inputError[i.param].push({ message: i.msg, name: i.param });
    }

    console.log(">> this is inputErrors <<", inputError);

    return res.status(400).json({ success: false, inputError });
  } else {
    return next();
  }
};

module.exports = { 
  preValidator,
  validator,
  codeValidation,
  EmailOrUsernameValidation,
  passwordValidation,
  signupValidation,
  signinValidation,
  securityValidation,
  appearanceValidation,
  recoverPasswordValidation,
};
