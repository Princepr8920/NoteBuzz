const session = require("express-session"),
  MongoStore = require("connect-mongo");

module.exports = session({
  secret: process.env.TOP_SECRET,
  resave: true,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  },
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_DB_URL,
  }),
});
