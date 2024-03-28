async function immutableFields(req, res, next) {
  let path = req.path;
  let data = req.body;


// This middleware prevent to change below fields by user

  let fields = [
    "userID",
    "tokens",
    "_id",
    "user_logs",
    "feedback",
    "userRequests",
    "verification",
    "confirmationCode",
    "joined_at",
    "last_visit",
    "provider",
    "__v",
    "events"    
  ];

  for (let i of fields) {
    if (data.hasOwnProperty(i)) {
      delete data[i];
    }
  }

  if (
    data.hasOwnProperty("email") &&
    path !== "/api/user/account-information"
    // Prevent to change email without verificaiton
  ) {
    delete data.email;
  }

  next();
}

module.exports = immutableFields;
